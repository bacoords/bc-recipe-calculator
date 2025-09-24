<?php
/**
 * Plugin Name: BC Recipe Calculator
 * Description: Custom post type for recipes with calculator functionality
 * Version: 1.0.3
 * Author: BC Recipe Calculator
 * License: GPL v2 or later
 * Text Domain: bc-recipe-calculator
 *
 * @package BCRecipeCalculator
 */

namespace BCRecipeCalculator;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Main plugin class
 */
class BCRecipeCalculator {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_recipe_post_type' ) );
		add_action( 'init', array( $this, 'register_ingredient_taxonomy' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		add_action( 'admin_menu', array( $this, 'add_recipes_dashboard_page' ) );

		// Add hooks for ingredient taxonomy custom fields.
		add_action( 'bc_ingredient_add_form_fields', array( $this, 'add_ingredient_custom_fields' ) );
		add_action( 'bc_ingredient_edit_form_fields', array( $this, 'edit_ingredient_custom_fields' ) );
		add_action( 'created_bc_ingredient', array( $this, 'save_ingredient_custom_fields' ) );
		add_action( 'edited_bc_ingredient', array( $this, 'save_ingredient_custom_fields' ) );

		// Add hooks for ingredient taxonomy admin table columns.
		add_filter( 'manage_edit-bc_ingredient_columns', array( $this, 'add_ingredient_admin_columns' ) );
		add_filter( 'manage_bc_ingredient_custom_column', array( $this, 'populate_ingredient_admin_columns' ), 10, 3 );

		// Add hooks for recipe post type admin table columns.
		add_filter( 'manage_edit-bc_recipe_columns', array( $this, 'add_recipe_admin_columns' ) );
		add_filter( 'manage_bc_recipe_posts_custom_column', array( $this, 'populate_recipe_admin_columns' ), 10, 2 );

		// Add REST API support for taxonomy meta.
		add_action( 'rest_api_init', array( $this, 'register_taxonomy_meta_rest_fields' ) );

		// Register post meta fields for recipes.
		add_action( 'init', array( $this, 'register_recipe_post_meta' ) );
	}

	/**
	 * Register the recipe custom post type
	 */
	public function register_recipe_post_type() {
		$labels = array(
			'name'               => 'Recipes',
			'singular_name'      => 'Recipe',
			'menu_name'          => 'Recipes',
			'add_new'            => 'Add New',
			'add_new_item'       => 'Add New Recipe',
			'edit_item'          => 'Edit Recipe',
			'new_item'           => 'New Recipe',
			'view_item'          => 'View Recipe',
			'search_items'       => 'Search Recipes',
			'not_found'          => 'No recipes found',
			'not_found_in_trash' => 'No recipes found in trash',
		);

		$args = array(
			'labels'             => $labels,
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => false,
			'show_in_menu'       => true,
			'query_var'          => false,
			'rewrite'            => false,
			'capability_type'    => 'post',
			'has_archive'        => false,
			'hierarchical'       => false,
			'menu_position'      => 20,
			'menu_icon'          => 'dashicons-food',
			'supports'           => array( 'title', 'custom-fields' ),
			'show_in_rest'       => true,
		);

		register_post_type( 'bc_recipe', $args );
	}

	/**
	 * Register the ingredient taxonomy
	 */
	public function register_ingredient_taxonomy() {
		$labels = array(
			'name'              => 'Ingredients',
			'singular_name'     => 'Ingredient',
			'search_items'      => 'Search Ingredients',
			'all_items'         => 'All Ingredients',
			'parent_item'       => 'Parent Ingredient',
			'parent_item_colon' => 'Parent Ingredient:',
			'edit_item'         => 'Edit Ingredient',
			'update_item'       => 'Update Ingredient',
			'add_new_item'      => 'Add New Ingredient',
			'new_item_name'     => 'New Ingredient Name',
			'menu_name'         => 'Ingredients',
		);

		$args = array(
			'hierarchical'      => false,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => false,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'ingredient' ),
			'show_in_rest'      => true,
		);

		register_taxonomy( 'bc_ingredient', array( 'bc_recipe' ), $args );
	}

	/**
	 * Register REST API fields for taxonomy meta
	 */
	public function register_taxonomy_meta_rest_fields() {
		register_rest_field(
			'bc_ingredient',
			'meta',
			array(
				'get_callback'    => array( $this, 'get_taxonomy_meta' ),
				'update_callback' => array( $this, 'update_taxonomy_meta' ),
				'schema'          => array(
					'description' => 'Taxonomy meta fields.',
					'type'        => 'object',
				),
			)
		);
	}

	/**
	 * Get taxonomy meta for REST API
	 *
	 * @param array $object The taxonomy term object.
	 * @return array Meta fields.
	 */
	public function get_taxonomy_meta( $object ) {
		$term_id = $object['id'];
		return array(
			'ingredient_price'    => get_term_meta( $term_id, 'ingredient_price', true ),
			'ingredient_quantity' => get_term_meta( $term_id, 'ingredient_quantity', true ),
			'ingredient_unit'     => get_term_meta( $term_id, 'ingredient_unit', true ),
		);
	}

	/**
	 * Update taxonomy meta for REST API
	 *
	 * @param mixed  $value The meta value.
	 * @param object $object The taxonomy term object.
	 * @return bool|WP_Error
	 */
	public function update_taxonomy_meta( $value, $object ) {
		$term_id = $object->term_id;

		if ( isset( $value['ingredient_price'] ) ) {
			update_term_meta( $term_id, 'ingredient_price', sanitize_text_field( $value['ingredient_price'] ) );
		}

		if ( isset( $value['ingredient_quantity'] ) ) {
			update_term_meta( $term_id, 'ingredient_quantity', sanitize_text_field( $value['ingredient_quantity'] ) );
		}

		if ( isset( $value['ingredient_unit'] ) ) {
			update_term_meta( $term_id, 'ingredient_unit', sanitize_text_field( $value['ingredient_unit'] ) );
		}

		return true;
	}

	/**
	 * Register post meta fields for recipes
	 */
	public function register_recipe_post_meta() {
		register_post_meta(
			'bc_recipe',
			'recipe_servings',
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'number',
				'default'           => 1,
				'sanitize_callback' => 'absint',
			)
		);

		register_post_meta(
			'bc_recipe',
			'recipe_ingredients',
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'string',
				'default'           => '[]',
				'sanitize_callback' => array( $this, 'sanitize_recipe_ingredients' ),
			)
		);

		register_post_meta(
			'bc_recipe',
			'total_cost',
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'number',
				'default'           => 0,
				'sanitize_callback' => array( $this, 'sanitize_cost_field' ),
			)
		);

		register_post_meta(
			'bc_recipe',
			'cost_per_serving',
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'number',
				'default'           => 0,
				'sanitize_callback' => array( $this, 'sanitize_cost_field' ),
			)
		);
	}

	/**
	 * Sanitize recipe ingredients JSON
	 *
	 * @param mixed $value The meta value.
	 * @return string Sanitized JSON string.
	 */
	public function sanitize_recipe_ingredients( $value ) {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return wp_json_encode( $decoded );
			}
		}
		return '[]';
	}

	/**
	 * Sanitize cost fields
	 *
	 * @param mixed $value The meta value.
	 * @return float Sanitized cost value.
	 */
	public function sanitize_cost_field( $value ) {
		$cost = floatval( $value );
		return max( 0, $cost );
	}



	/**
	 * Add custom fields to the ingredient add form
	 */
	public function add_ingredient_custom_fields() {
		// Add nonce for security.
		wp_nonce_field( 'add-tag', '_wpnonce_add-tag' );
		?>
		<div class="form-field">
			<label for="ingredient_price"><?php esc_html_e( 'Price', 'bc-recipe-calculator' ); ?></label>
			<input type="number" name="ingredient_price" id="ingredient_price" step="0.01" min="0" />
			<p class="description"><?php esc_html_e( 'Enter the price per unit of this ingredient.', 'bc-recipe-calculator' ); ?></p>
		</div>
		<div class="form-field">
			<label for="ingredient_quantity"><?php esc_html_e( 'Quantity', 'bc-recipe-calculator' ); ?></label>
			<input type="number" name="ingredient_quantity" id="ingredient_quantity" step="0.01" min="0" />
			<p class="description"><?php esc_html_e( 'Enter the default quantity for this ingredient.', 'bc-recipe-calculator' ); ?></p>
		</div>
		<div class="form-field">
			<label for="ingredient_unit"><?php esc_html_e( 'Unit', 'bc-recipe-calculator' ); ?></label>
			<input type="text" name="ingredient_unit" id="ingredient_unit" />
			<p class="description"><?php esc_html_e( 'Enter the unit for this ingredient (e.g., grams, cups, oz).', 'bc-recipe-calculator' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Add custom fields to the ingredient edit form
	 *
	 * @param WP_Term $term The term object.
	 */
	public function edit_ingredient_custom_fields( $term ) {
		$price    = get_term_meta( $term->term_id, 'ingredient_price', true );
		$quantity = get_term_meta( $term->term_id, 'ingredient_quantity', true );
		$unit     = get_term_meta( $term->term_id, 'ingredient_unit', true );
		?>
		<tr class="form-field">
			<th scope="row">
				<label for="ingredient_price"><?php esc_html_e( 'Price', 'bc-recipe-calculator' ); ?></label>
			</th>
			<td>
				<input type="number" name="ingredient_price" id="ingredient_price" value="<?php echo esc_attr( $price ); ?>" step="0.01" min="0" />
				<p class="description"><?php esc_html_e( 'Enter the price per unit of this ingredient.', 'bc-recipe-calculator' ); ?></p>
			</td>
		</tr>
		<tr class="form-field">
			<th scope="row">
				<label for="ingredient_quantity"><?php esc_html_e( 'Quantity', 'bc-recipe-calculator' ); ?></label>
			</th>
			<td>
				<input type="number" name="ingredient_quantity" id="ingredient_quantity" value="<?php echo esc_attr( $quantity ); ?>" step="0.01" min="0" />
				<p class="description"><?php esc_html_e( 'Enter the default quantity for this ingredient.', 'bc-recipe-calculator' ); ?></p>
			</td>
		</tr>
		<tr class="form-field">
			<th scope="row">
				<label for="ingredient_unit"><?php esc_html_e( 'Unit', 'bc-recipe-calculator' ); ?></label>
			</th>
			<td>
				<input type="text" name="ingredient_unit" id="ingredient_unit" value="<?php echo esc_attr( $unit ); ?>" />
				<p class="description"><?php esc_html_e( 'Enter the unit for this ingredient (e.g., grams, cups, oz).', 'bc-recipe-calculator' ); ?></p>
			</td>
		</tr>
		<?php
	}

	/**
	 * Save the ingredient custom fields
	 *
	 * @param int $term_id The term ID.
	 */
	public function save_ingredient_custom_fields( $term_id ) {
		// Verify nonce for security - handle both creation and editing scenarios.
		$nonce_verified = false;

		if ( isset( $_POST['_wpnonce'] ) ) {
			// Check for edit nonce (when editing existing term).
			if ( wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'update-tag_' . $term_id ) ) {
				$nonce_verified = true;
			}
			// Check for add nonce (when creating new term).
			elseif ( wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'add-tag' ) ) {
				$nonce_verified = true;
			}
		}
		// Check for the specific add-tag nonce field we added.
		elseif ( isset( $_POST['_wpnonce_add-tag'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce_add-tag'] ) ), 'add-tag' ) ) {
			$nonce_verified = true;
		}

		if ( ! $nonce_verified ) {
			return;
		}

		if ( isset( $_POST['ingredient_price'] ) ) {
			$price = sanitize_text_field( wp_unslash( $_POST['ingredient_price'] ) );
			update_term_meta( $term_id, 'ingredient_price', $price );
		}

		if ( isset( $_POST['ingredient_quantity'] ) ) {
			$quantity = sanitize_text_field( wp_unslash( $_POST['ingredient_quantity'] ) );
			update_term_meta( $term_id, 'ingredient_quantity', $quantity );
		}

		if ( isset( $_POST['ingredient_unit'] ) ) {
			$unit = sanitize_text_field( wp_unslash( $_POST['ingredient_unit'] ) );
			update_term_meta( $term_id, 'ingredient_unit', $unit );
		}
	}

	/**
	 * Add custom columns to the ingredient taxonomy admin table
	 *
	 * @param array $columns The existing columns.
	 * @return array Modified columns array.
	 */
	public function add_ingredient_admin_columns( $columns ) {
		$new_columns = array();

		// Add our custom columns after the name column.
		foreach ( $columns as $key => $value ) {
			$new_columns[ $key ] = $value;
			if ( 'name' === $key ) {
				$new_columns['ingredient_price']    = __( 'Price', 'bc-recipe-calculator' );
				$new_columns['ingredient_quantity'] = __( 'Quantity', 'bc-recipe-calculator' );
				$new_columns['ingredient_unit']     = __( 'Unit', 'bc-recipe-calculator' );
			}
		}

		return $new_columns;
	}

	/**
	 * Populate the custom columns in the ingredient taxonomy admin table
	 *
	 * @param string $content The column content.
	 * @param string $column_name The column name.
	 * @param int    $term_id The term ID.
	 * @return string The column content.
	 */
	public function populate_ingredient_admin_columns( $content, $column_name, $term_id ) {
		switch ( $column_name ) {
			case 'ingredient_price':
				$price = get_term_meta( $term_id, 'ingredient_price', true );
				return $price ? '$' . number_format( (float) $price, 2 ) : '—';

			case 'ingredient_quantity':
				$quantity = get_term_meta( $term_id, 'ingredient_quantity', true );
				return $quantity ? esc_html( $quantity ) : '—';

			case 'ingredient_unit':
				$unit = get_term_meta( $term_id, 'ingredient_unit', true );
				return $unit ? esc_html( $unit ) : '—';

			default:
				return $content;
		}
	}

	/**
	 * Add custom columns to the recipe post type admin table
	 *
	 * @param array $columns The existing columns.
	 * @return array Modified columns array.
	 */
	public function add_recipe_admin_columns( $columns ) {
		$new_columns = array();

		// Add our custom columns after the title column.
		foreach ( $columns as $key => $value ) {
			$new_columns[ $key ] = $value;
			if ( 'title' === $key ) {
				$new_columns['recipe_servings']  = __( 'Servings', 'bc-recipe-calculator' );
				$new_columns['total_cost']       = __( 'Total Cost', 'bc-recipe-calculator' );
				$new_columns['cost_per_serving'] = __( 'Cost per Serving', 'bc-recipe-calculator' );
			}
		}

		return $new_columns;
	}

	/**
	 * Populate the custom columns in the recipe post type admin table
	 *
	 * @param string $column_name The column name.
	 * @param int    $post_id The post ID.
	 */
	public function populate_recipe_admin_columns( $column_name, $post_id ) {
		switch ( $column_name ) {
			case 'recipe_servings':
				$servings = get_post_meta( $post_id, 'recipe_servings', true );
				echo $servings ? esc_html( $servings ) : '—';
				break;

			case 'total_cost':
				$total_cost = get_post_meta( $post_id, 'total_cost', true );
				echo $total_cost ? '$' . number_format( (float) $total_cost, 2 ) : '—';
				break;

			case 'cost_per_serving':
				$cost_per_serving = get_post_meta( $post_id, 'cost_per_serving', true );
				echo $cost_per_serving ? '$' . number_format( (float) $cost_per_serving, 2 ) : '—';
				break;
		}
	}

	/**
	 * Add recipes dashboard page
	 */
	public function add_recipes_dashboard_page() {
		add_menu_page(
			'Recipes', // Page title.
			'Recipes', // Menu title.
			'manage_options', // Capability required.
			'recipes-dashboard', // Menu slug.
			array( $this, 'render_recipes_dashboard_page' ), // Callback function.
			'dashicons-food', // Icon.
			58 // Position.
		);
	}

	/**
	 * Render the recipes dashboard page
	 */
	public function render_recipes_dashboard_page() {
		?>
		<div class="wrap">
			<div id="bc-recipe-calculator"></div>
		</div>
		<?php
	}

	/**
	 * Enqueue admin scripts for bc_recipe post type edit screen.
	 *
	 * @param string $hook The current admin page.
	 */
	public function enqueue_admin_scripts( $hook ) {

		// Only enqueue on the recipes dashboard page.
		if ( 'toplevel_page_recipes-dashboard' === $hook ) {
			$asset_file = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

			if ( file_exists( $asset_file ) ) {
				// Enqueue the styles for the core components library.
				wp_enqueue_style( 'global' );
				wp_enqueue_style( 'wp-edit-post' );
				wp_enqueue_style( 'wp-components' );

				$asset_data = require $asset_file;
				wp_enqueue_script(
					'bc-recipe-calculator-admin',
					plugin_dir_url( __FILE__ ) . 'build/index.js',
					$asset_data['dependencies'],
					$asset_data['version'],
					true
				);
				wp_enqueue_style(
					'bc-recipe-calculator-admin',
					plugin_dir_url( __FILE__ ) . 'build/style-index.css',
					array(),
					$asset_data['version']
				);

				// Localize script with API settings and post ID.
				wp_localize_script(
					'bc-recipe-calculator-admin',
					'wpApiSettings',
					array(
						'nonce' => wp_create_nonce( 'wp_rest' ),
						'root'  => esc_url_raw( rest_url() ),
					)
				);

				// Pass the current post ID to JavaScript.
				wp_localize_script(
					'bc-recipe-calculator-admin',
					'bcRecipeCalculator',
					array(
						'postId' => get_the_ID(),
					)
				);
			}
		}
	}
}

// Initialize the plugin.
new BCRecipeCalculator();
