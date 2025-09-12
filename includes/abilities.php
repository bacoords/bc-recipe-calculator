<?php
/**
 * Messing around with MCP Capabilities
 */

namespace BCRecipeCalculator\Abilities;

use WP\MCP\Core\McpAdapter;

// Hook into the MCP adapter initialization
add_action( 'mcp_adapter_init', function( $adapter ) {
    $adapter->create_server(
        'bc-recipe-calculator-server',                          // Unique server ID
        'bc-recipe-calculator',                                // REST API namespace
        'mcp',                                      // REST API route
        'Recipe MCP Server',                      // Human-readable name
        'A simple MCP server for demonstration',    // Description
        '1.0.0',                                    // Version
        [                                           // Transport methods
            \WP\MCP\Transport\Http\RestTransport::class,
        ],
        \WP\MCP\Infrastructure\ErrorHandling\ErrorLogMcpErrorHandler::class, // Error handler
        \WP\MCP\Infrastructure\Observability\NullMcpObservabilityHandler::class, // Error handler
        [                                           // Abilities to expose as tools
            'bc-recipe-calculator/get-recipes',
            'bc-recipe-calculator/get-ingredients',
            'bc-recipe-calculator/create-ingredient'
        ],
        [],
        [],
        function(): bool {  // Permission callback
            return current_user_can('manage_options');
        }
    );
});

// Register a simple ability to get site information
add_action('abilities_api_init', function () {
    wp_register_ability('bc-recipe-calculator/get-recipes', [
        'label' => 'Get Recipes',
        'description' => 'Retrieves basic information about the current recipes available, including the total cost for one batch and the cost for serving.',
        'input_schema' => [],
        'output_schema' => [
            'type' => 'object',
            'properties' => [
                'recipes' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => ['type' => 'string'],
                            'total_cost' => ['type' => 'number'],
                            'cost_per_serving' => ['type' => 'number']
                        ],
                        'required' => ['title', 'total_cost']
                    ]
                ],
                'count' => ['type' => 'integer']
            ]
        ],
        'execute_callback' => function ($input) {
            $recipes = get_posts([
                'post_type' => 'bc_recipe',
                'numberposts' => -1,
                'post_status' => 'publish',
            ]);

            $recipe_data = array_map(function($recipe) {
                // Get the title
                $title = get_the_title($recipe->ID);
                // Assume total cost is stored as post meta 'total_cost', fallback to 0 if not set
                $total_cost = get_post_meta($recipe->ID, 'total_cost', true);
                if ($total_cost === '') {
                    $total_cost = 0;
                }
                // Assume cost per unit is stored as post meta 'cost_per_serving', fallback to 0 if not set
                $cost_per_serving = get_post_meta($recipe->ID, 'cost_per_serving', true);
                if ($cost_per_serving === '') {
                    $cost_per_serving = 0;
                }
                return [
                    'title' => $title,
                    'total_cost' => number_format((float) $total_cost, 2, '.', ''),
                    'cost_per_serving' => number_format((float) $cost_per_serving, 2, '.', '')
                ];
            }, $recipes);

            return [
                'recipes' => $recipe_data,
                'count' => count($recipe_data)
            ];
        },
        'permission_callback' => function () {
            // Allow any authenticated user
            return current_user_can( 'edit_posts' );
        }
    ]);


    wp_register_ability('bc-recipe-calculator/get-ingredients', [
        'label' => 'Get Ingredients',
        'description' => 'Retrieves basic information about the current ingredients available, including the total cost and amount in the ingredient.',
        'input_schema' => [],
        'output_schema' => [
            'type' => 'object',
            'properties' => [
                'ingredients' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'name' => ['type' => 'string'],
                            'ingredient_price' => ['type' => 'number'],
                            'ingredient_quantity' => ['type' => 'number'],
                            'ingredient_unit' => ['type' => 'string']
                        ],
                        'required' => ['name', 'ingredient_price', 'ingredient_quantity', 'ingredient_unit']
                    ]
                ],
                'count' => ['type' => 'integer']
            ]
        ],
        'execute_callback' => function ($input) {
            $terms = get_terms([
                'taxonomy' => 'bc_ingredient',
                'hide_empty' => false,
            ]);

            $ingredient_data = array_map(function($term) {
                $name = $term->name;
                $ingredient_price = get_term_meta($term->term_id, 'ingredient_price', true);
                if ($ingredient_price === '') {
                    $ingredient_price = 0;
                }
                $ingredient_quantity = get_term_meta($term->term_id, 'ingredient_quantity', true);
                if ($ingredient_quantity === '') {
                    $ingredient_quantity = 0;
                }
                $ingredient_unit = get_term_meta($term->term_id, 'ingredient_unit', true);
                if ($ingredient_unit === '') {
                    $ingredient_unit = '';
                }
                return [
                    'name' => $name,
                    'ingredient_price' => (float) $ingredient_price,
                    'ingredient_quantity' => (float) $ingredient_quantity,
                    'ingredient_unit' => $ingredient_unit
                ];
            }, $terms);

            return [
                'ingredients' => $ingredient_data,
                'count' => count($ingredient_data)
            ];
        },
        'permission_callback' => function () {
            // Allow any authenticated user
            return current_user_can( 'edit_posts' );
        }
    ]);


    // Ability to create a new ingredient
    wp_register_ability('bc-recipe-calculator/create-ingredient', [
        'label' => 'Create Ingredient',
        'description' => 'Creates a new ingredient in the bc_ingredient taxonomy with price, quantity, and unit.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'name' => [
                    'type' => 'string',
                    'description' => 'The name of the ingredient.'
                ],
                'ingredient_price' => [
                    'type' => 'number',
                    'description' => 'The price of the ingredient.'
                ],
                'ingredient_quantity' => [
                    'type' => 'number',
                    'description' => 'The quantity of the ingredient.'
                ],
                'ingredient_unit' => [
                    'type' => 'string',
                    'description' => 'The unit of the ingredient.'
                ]
            ],
            'required' => ['name', 'ingredient_price', 'ingredient_quantity', 'ingredient_unit']
        ],
        'output_schema' => [
            'type' => 'object',
            'properties' => [
                'term_id' => ['type' => 'integer'],
                'name' => ['type' => 'string'],
                'ingredient_price' => ['type' => 'number'],
                'ingredient_quantity' => ['type' => 'number'],
                'ingredient_unit' => ['type' => 'string']
            ],
            'required' => ['term_id', 'name', 'ingredient_price', 'ingredient_quantity', 'ingredient_unit']
        ],
        'execute_callback' => function ($input) {
            $result = wp_insert_term($input['name'], 'bc_ingredient');
            if (is_wp_error($result)) {
                return [
                    'error' => $result->get_error_message()
                ];
            }
            $term_id = $result['term_id'];
            update_term_meta($term_id, 'ingredient_price', $input['ingredient_price']);
            update_term_meta($term_id, 'ingredient_quantity', $input['ingredient_quantity']);
            update_term_meta($term_id, 'ingredient_unit', $input['ingredient_unit']);
            return [
                'term_id' => (int) $term_id,
                'name' => $input['name'],
                'ingredient_price' => (float) $input['ingredient_price'],
                'ingredient_quantity' => (float) $input['ingredient_quantity'],
                'ingredient_unit' => $input['ingredient_unit']
            ];
        },
        'permission_callback' => function () {
            // Allow any authenticated user
            return current_user_can( 'edit_posts' );
        }
    ]);
});
