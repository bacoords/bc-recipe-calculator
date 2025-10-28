<?php
/**
 * WooCommerce Integration for BC Recipe Calculator
 *
 * Adds a "Recipes" tab to WooCommerce product data metabox
 *
 * @package BCRecipeCalculator
 */

namespace BCRecipeCalculator\WooCommerce;

/**
 * WooCommerce Integration class
 */
class WooCommerceIntegration {

	/**
	 * Constructor
	 */
	public function __construct() {
		// Add custom metabox to product edit screen.
		add_action( 'add_meta_boxes', array( $this, 'add_recipe_metabox' ) );

		// Save recipe data when product is saved.
		add_action( 'save_post_product', array( $this, 'save_recipe_metabox_data' ) );

		// Enqueue scripts for product edit page.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_product_edit_scripts' ) );
	}

	/**
	 * Add custom metabox for recipes
	 */
	public function add_recipe_metabox() {
		add_meta_box(
			'bc_recipe_metabox',
			__( 'Recipe Cost of Goods', 'bc-recipe-calculator' ),
			array( $this, 'render_recipe_metabox' ),
			'product',
			'normal',
			'high'
		);
	}

	/**
	 * Render the recipe metabox content
	 *
	 * @param WP_Post $post The current post object.
	 */
	public function render_recipe_metabox( $post ) {
		// Add nonce for security.
		wp_nonce_field( 'bc_recipe_metabox', 'bc_recipe_metabox_nonce' );
		?>
		<div class="bc-recipe-search-wrapper">
			<p class="description">
				<?php esc_html_e( 'Search for recipes to view their cost of goods information.', 'bc-recipe-calculator' ); ?>
			</p>

			<div class="bc-recipe-search-field" style="margin: 20px 0;">
				<label for="bc_recipe_search">
					<?php esc_html_e( 'Search Recipes:', 'bc-recipe-calculator' ); ?>
				</label>
				<input
					type="text"
					id="bc_recipe_search"
					class="bc-recipe-search-input widefat"
					placeholder="<?php esc_attr_e( 'Start typing to search recipes...', 'bc-recipe-calculator' ); ?>"
					style="margin-top: 8px;"
				/>
				<span class="spinner" style="float: none; margin: 0 0 0 10px;"></span>
			</div>

			<div id="bc-recipe-results" class="bc-recipe-results" style="margin-top: 20px;">
				<!-- Recipe results will be loaded here via REST API -->
			</div>

			<div id="bc-selected-recipe" class="bc-selected-recipe" style="margin-top: 20px; display: none;">
				<h4><?php esc_html_e( 'Selected Recipe Details', 'bc-recipe-calculator' ); ?></h4>
				<div class="bc-recipe-details">
					<!-- Selected recipe details will be shown here -->
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Save recipe metabox data when product is saved
	 *
	 * @param int $post_id The product post ID.
	 */
	public function save_recipe_metabox_data( $post_id ) {
		// Check if nonce is set.
		if ( ! isset( $_POST['bc_recipe_metabox_nonce'] ) ) {
			return;
		}

		// Verify nonce.
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bc_recipe_metabox_nonce'] ) ), 'bc_recipe_metabox' ) ) {
			return;
		}

		// Check if this is an autosave.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check user permissions.
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// Save associated recipe ID if provided.
		if ( isset( $_POST['_bc_associated_recipe_id'] ) ) {
			update_post_meta(
				$post_id,
				'_bc_associated_recipe_id',
				absint( $_POST['_bc_associated_recipe_id'] )
			);
		}
	}

	/**
	 * Enqueue scripts for product edit page
	 *
	 * @param string $hook The current admin page hook.
	 */
	public function enqueue_product_edit_scripts( $hook ) {
		// Only load on product edit pages.
		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen || 'product' !== $screen->post_type ) {
			return;
		}

		// Enqueue the script.
		wp_enqueue_script(
			'bc-recipe-woocommerce',
			BC_RECIPE_CALCULATOR_URL . 'assets/js/woocommerce-integration.js',
			array( 'jquery' ),
			BC_RECIPE_CALCULATOR_VERSION,
			true
		);

		// Enqueue the styles.
		wp_enqueue_style(
			'bc-recipe-woocommerce',
			BC_RECIPE_CALCULATOR_URL . 'assets/css/woocommerce-integration.css',
			array(),
			BC_RECIPE_CALCULATOR_VERSION
		);

		// Localize script with REST API settings.
		wp_localize_script(
			'bc-recipe-woocommerce',
			'bcRecipeWooCommerce',
			array(
				'rest_url'   => rest_url( 'wp/v2/bc_recipe' ),
				'rest_nonce' => wp_create_nonce( 'wp_rest' ),
			)
		);
	}
}

// Initialize the WooCommerce integration.
new WooCommerceIntegration();
