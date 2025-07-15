# BC Recipe Calculator

A WordPress plugin that provides a custom recipe management system with cost calculation functionality. Built with React and WordPress REST API.

## Features

- **Custom Post Type**: `bc_recipe` for managing recipes
- **Custom Taxonomy**: `bc_ingredient` for organizing ingredients with pricing data
- **Cost Calculation**: Automatic calculation of recipe costs based on ingredient prices and quantities
- **React Interface**: Modern admin interface built with WordPress components
- **REST API Integration**: Full REST API support for recipes and ingredients
- **Price Tracking**: Tracks ingredient price changes and alerts users
- **Serving Calculator**: Calculate cost per serving based on recipe yield

### To Dos

- Import/Export
- Sync to COGS

## Installation

### Prerequisites

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Node.js and npm (for development)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bacoords/bc-recipe-calculator.git
   cd bc-recipe-calculator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the plugin**:
   ```bash
   npm run build
   npm run plugin-zip
   ```

4. **Activate the plugin**:
   - Upload the generated zip through the WordPress admin panel
   - Activate the plugin through the WordPress admin panel

## Development

### Project Structure

```
bc-recipe-calculator/
├── bc-recipe-calculator.php    # Main plugin file
├── package.json                # Node.js dependencies
├── src/
│   ├── index.js               # Main React entry point
│   ├── style.scss             # Styles
│   └── components/
│       ├── App.js             # Main app component
│       ├── SingleRecipe.js    # Recipe editor component
│       ├── CreateRecipeModal.js    # New recipe modal
│       ├── ShoppingList.js        # Shopping list component
│       ├── Header.js              # Header component
│       └── CreateIngredientModal.js # New ingredient modal
└── build/                     # Compiled assets (gitignored)
```

### Development Commands

```bash
# Start development server with hot reloading
npm run start

# Build for production
npm run build

# Watch for changes and rebuild
npm run build -- --watch
```

### WordPress Integration

The plugin creates:

- **Custom Post Type**: `bc_recipe`
  - Stores recipe title, servings, ingredients, and cost data
  - REST API enabled for React integration

- **Custom Taxonomy**: `bc_ingredient`
  - Stores ingredient name, price, quantity, and unit
  - Custom meta fields for pricing information
  - REST API enabled

### Key Components

#### SingleRecipe.js
Main recipe editor component that handles:
- Recipe title and serving count
- Ingredient selection from taxonomy
- Cost calculation based on ingredient prices
- Price change detection and alerts
- Recipe saving via REST API

#### CreateIngredientModal.js
Modal for creating new ingredients with:
- Ingredient name input
- Price and quantity fields
- Unit selection
- Taxonomy term creation

#### App.js
Main application component that manages:
- Recipe listing and navigation
- Modal state management
- Data fetching and caching

## Usage

### Creating Ingredients

1. Navigate to **Recipes > Ingredients** in the WordPress admin
2. Click **Add New Ingredient**
3. Fill in:
   - **Name**: Ingredient name (e.g., "All-Purpose Flour")
   - **Price**: Cost of the package
   - **Quantity**: Amount in the package
   - **Unit**: Unit of measurement (e.g., "cups", "grams")

### Creating Recipes

1. Navigate to **Recipes** in the WordPress admin
2. Click **Add New Recipe**
3. Fill in:
   - **Recipe Title**: Name of the recipe
   - **Number of Servings**: How many people the recipe serves
   - **Ingredients**: Select ingredients from the dropdown and specify amounts used

### Cost Calculation

The plugin automatically calculates:
- **Total Recipe Cost**: Sum of all ingredient costs
- **Cost per Serving**: Total cost divided by number of servings
- **Ingredient Costs**: Based on price per unit × amount used

### Price Change Detection

The plugin tracks ingredient price changes and alerts users when:
- Ingredient prices have been updated
- Package quantities have changed
- Unit prices have been modified

## API Endpoints

### Recipes
- `GET /wp-json/wp/v2/bc_recipe` - List recipes
- `GET /wp-json/wp/v2/bc_recipe/{id}` - Get single recipe
- `POST /wp-json/wp/v2/bc_recipe` - Create recipe
- `POST /wp-json/wp/v2/bc_recipe/{id}` - Update recipe

### Ingredients
- `GET /wp-json/wp/v2/bc_ingredient` - List ingredients
- `GET /wp-json/wp/v2/bc_ingredient/{id}` - Get single ingredient
- `POST /wp-json/wp/v2/bc_ingredient` - Create ingredient
- `POST /wp-json/wp/v2/bc_ingredient/{id}` - Update ingredient

## Customization

### Adding Custom Fields

To add custom fields to recipes or ingredients, modify the respective registration functions in `bc-recipe-calculator.php`:

```php
// For recipes
register_post_meta('bc_recipe', 'custom_field', array(
    'show_in_rest' => true,
    'single' => true,
    'type' => 'string',
));

// For ingredients
add_term_meta('bc_ingredient', 'custom_field', 'value');
```

### Styling

Custom styles can be added to `src/style.scss`. The build process will compile this to CSS.

## Troubleshooting

### Common Issues

1. **Build files not updating**: Run `npm run build` to regenerate build files
2. **REST API errors**: Ensure WordPress REST API is enabled and accessible
3. **Permission errors**: Check that the plugin has proper WordPress permissions

### Debug Mode

Enable WordPress debug mode to see detailed error messages:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run `npm run build` to ensure everything compiles
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the GPL v2 or later - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Note**: This plugin requires WordPress 5.0+ and PHP 7.4+ for optimal functionality. 