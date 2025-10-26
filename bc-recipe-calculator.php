<?php
/**
 * Plugin Name: BC Recipe Calculator
 * Description: Custom post type for recipes with calculator functionality
 * Version: 1.0.6
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

// Plugin constants.
define( 'BC_RECIPE_CALCULATOR_VERSION', '1.0.3' );
define( 'BC_RECIPE_CALCULATOR_FILE', __FILE__ );
define( 'BC_RECIPE_CALCULATOR_DIR', plugin_dir_path( BC_RECIPE_CALCULATOR_FILE ) );
define( 'BC_RECIPE_CALCULATOR_URL', plugin_dir_url( BC_RECIPE_CALCULATOR_FILE ) );
define( 'BC_RECIPE_CALCULATOR_BASENAME', plugin_basename( BC_RECIPE_CALCULATOR_FILE ) );
define( 'BC_RECIPE_CALCULATOR_INCLUDES_DIR', BC_RECIPE_CALCULATOR_DIR . 'includes/' );
define( 'BC_RECIPE_CALCULATOR_ASSETS_DIR', BC_RECIPE_CALCULATOR_DIR . 'assets/' );
define( 'BC_RECIPE_CALCULATOR_ASSETS_URL', BC_RECIPE_CALCULATOR_URL . 'assets/' );

require_once 'includes/cpts.php';
require_once 'includes/abilities.php';
