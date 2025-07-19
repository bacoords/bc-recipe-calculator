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

## Screenshots

<img width="1446" height="933" alt="Screenshot 2025-07-19 at 8 51 55 AM" src="https://github.com/user-attachments/assets/8dc92490-4f81-4ebc-ba65-6c37d25e235d" />
<img width="1442" height="930" alt="Screenshot 2025-07-19 at 8 52 13 AM" src="https://github.com/user-attachments/assets/13634656-ade1-4aaf-be0b-f3a9b8e7ff5b" />
<img width="1444" height="931" alt="Screenshot 2025-07-19 at 8 52 27 AM" src="https://github.com/user-attachments/assets/e61647a2-14ce-49d3-acd1-77dfe4e14be2" />
<img width="1443" height="930" alt="Screenshot 2025-07-19 at 8 52 40 AM" src="https://github.com/user-attachments/assets/0b80d8a8-355e-4a9b-88e4-e0164b0c73d5" />
<img width="1444" height="933" alt="Screenshot 2025-07-19 at 8 52 56 AM" src="https://github.com/user-attachments/assets/70d27b59-a60f-4632-956b-9d39bc254e48" />


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
│   ├── components/
│   │   ├── App.js             # Main app component
│   │   ├── Header.js          # Header component
│   │   ├── SingleRecipe.js    # Recipe editor component
│   │   ├── SingleIngredient.js # Ingredient editor component
│   │   ├── CreateRecipeModal.js    # New recipe modal
│   │   ├── CreateIngredientModal.js # New ingredient modal
│   │   ├── ShoppingList.js    # Shopping list component
│   │   └── views/
│   │       ├── RecipesView.js      # Recipes list view
│   │       ├── IngredientsView.js  # Ingredients list view
│   │       └── ShoppingListView.js # Shopping list view
│   ├── config/
│   │   ├── recipeActions.js   # Recipe CRUD actions
│   │   ├── recipeFields.js    # Recipe form fields config
│   │   ├── ingredientActions.js # Ingredient CRUD actions
│   │   └── ingredientFields.js  # Ingredient form fields config
│   ├── constants/
│   │   └── navigation.js      # Navigation constants
│   ├── hooks/
│   │   ├── useRecipes.js      # Recipe data hook
│   │   ├── useIngredients.js  # Ingredient data hook
│   │   ├── useNavigation.js   # Navigation hook
│   │   └── useViewState.js    # View state management hook
│   └── utils/
│       ├── navigation.js      # Navigation utilities
│       └── navigation.test.js # Navigation tests
└── build/                     # Compiled assets (gitignored)
    ├── index.js               # Compiled JavaScript
    ├── index.asset.php        # Asset dependencies
    ├── style-index.css        # Compiled styles
    └── style-index-rtl.css    # RTL compiled styles
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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run `npm run build` to ensure everything compiles
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the GPL v2 or later.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Note**: This plugin requires WordPress 6.8+ and PHP 7.4+ for optimal functionality. 
