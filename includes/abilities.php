<?php
/**
 * Messing around with MCP Capabilities
 */

namespace BCRecipeCalculator\Abilities;

add_filter( 'woocommerce_mcp_include_ability', function( $include, $ability_id ) {
    if ( str_starts_with( $ability_id, 'bc-recipe-calculator/' ) ) {
        return true;
    }
    return $include;
}, 10, 2 );

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


    // Ability to create a new recipe
    wp_register_ability('bc-recipe-calculator/create-recipe', [
        'label' => 'Create Recipe',
        'description' => 'Creates a new recipe in the bc_recipe post type with title, ingredients, and serving information.',
        'input_schema' => [
            'type' => 'object',
            'properties' => [
                'title' => [
                    'type' => 'string',
                    'description' => 'The title of the recipe.'
                ],
                'serving_count' => [
                    'type' => 'number',
                    'description' => 'The number of servings this recipe makes.'
                ],
                'ingredients' => [
                    'type' => 'array',
                    'description' => 'Array of ingredients used in the recipe.',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'ingredient_id' => [
                                'type' => 'integer',
                                'description' => 'The term ID of the ingredient.'
                            ],
                            'quantity' => [
                                'type' => 'number',
                                'description' => 'The quantity of this ingredient used in the recipe.'
                            ]
                        ],
                        'required' => ['ingredient_id', 'quantity']
                    ]
                ]
            ],
            'required' => ['title', 'serving_count']
        ],
        'output_schema' => [
            'type' => 'object',
            'properties' => [
                'post_id' => ['type' => 'integer'],
                'title' => ['type' => 'string'],
                'serving_count' => ['type' => 'number'],
                'total_cost' => ['type' => 'number'],
                'cost_per_serving' => ['type' => 'number']
            ],
            'required' => ['post_id', 'title']
        ],
        'execute_callback' => function ($input) {
            $post_data = [
                'post_title' => $input['title'],
                'post_type' => 'bc_recipe',
                'post_status' => 'publish'
            ];

            $post_id = wp_insert_post($post_data);

            if (is_wp_error($post_id)) {
                return [
                    'error' => $post_id->get_error_message()
                ];
            }

            // Set serving count
            $serving_count = isset($input['serving_count']) ? $input['serving_count'] : 1;
            update_post_meta($post_id, 'serving_count', $serving_count);

            // Set ingredients and calculate total cost
            $total_cost = 0;
            if (isset($input['ingredients']) && is_array($input['ingredients'])) {
                $ingredient_ids = array_column($input['ingredients'], 'ingredient_id');
                wp_set_object_terms($post_id, $ingredient_ids, 'bc_ingredient');

                // Store ingredient quantities and calculate cost
                foreach ($input['ingredients'] as $ingredient) {
                    $ingredient_id = $ingredient['ingredient_id'];
                    $quantity = $ingredient['quantity'];

                    update_post_meta($post_id, 'ingredient_' . $ingredient_id . '_quantity', $quantity);

                    // Calculate cost for this ingredient
                    $ingredient_price = get_term_meta($ingredient_id, 'ingredient_price', true);
                    $ingredient_quantity = get_term_meta($ingredient_id, 'ingredient_quantity', true);

                    if ($ingredient_price && $ingredient_quantity) {
                        $price_per_unit = (float) $ingredient_price / (float) $ingredient_quantity;
                        $total_cost += $price_per_unit * (float) $quantity;
                    }
                }
            }

            update_post_meta($post_id, 'total_cost', $total_cost);

            $cost_per_serving = $serving_count > 0 ? $total_cost / $serving_count : 0;
            update_post_meta($post_id, 'cost_per_serving', $cost_per_serving);

            return [
                'post_id' => (int) $post_id,
                'title' => $input['title'],
                'serving_count' => (float) $serving_count,
                'total_cost' => (float) $total_cost,
                'cost_per_serving' => (float) $cost_per_serving
            ];
        },
        'permission_callback' => function () {
            // Allow any authenticated user who can edit posts
            return current_user_can( 'edit_posts' );
        }
    ]);
});
