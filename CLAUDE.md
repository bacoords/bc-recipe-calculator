# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
```bash
# Start development server with hot reloading
npm run start

# Build for production
npm run build

# Watch for changes and rebuild
npm run build -- --watch

# Create plugin zip for distribution
npm run plugin-zip
```

### Testing
No test framework is currently configured. Tests would need to be set up if required.

## Architecture Overview

This is a WordPress plugin that creates a recipe management system with cost calculation functionality. The plugin follows a hybrid architecture combining PHP backend with React frontend.

### Core Components

**Backend (PHP)**
- Main plugin file: `bc-recipe-calculator.php`
- Creates custom post type `bc_recipe` for recipes
- Creates custom taxonomy `bc_ingredient` for ingredients with pricing metadata
- Extends WordPress REST API to expose recipe and ingredient data
- Handles WordPress admin integration and custom fields

**Frontend (React)**
- Entry point: `src/index.js`
- Main app component: `src/components/App.js`
- Uses WordPress TabPanel component for navigation between views
- Three main views: Recipes, Ingredients, Shopping List
- Custom hooks for state management and navigation

### Key Architecture Patterns

**Navigation System**
- Centralized navigation state in `useNavigation` hook
- URL-based routing using WordPress admin parameters
- Tab-based interface with view switching

**Data Management**
- WordPress REST API integration for CRUD operations
- Custom hooks (`useRecipes`, `useIngredients`) for data fetching
- React state management for UI state

**Modal System**
- Reusable modal components for creating recipes/ingredients
- Centralized modal state management

### Project Structure
```
src/
├── components/
│   ├── App.js                    # Main app with tab navigation
│   ├── views/                    # Tab content components
│   │   ├── RecipesView.js        # Recipe listing/editing
│   │   ├── IngredientsView.js    # Ingredient management
│   │   └── ShoppingListView.js   # Shopping list generation
│   ├── CreateRecipeModal.js      # New recipe creation
│   ├── CreateIngredientModal.js  # New ingredient creation
│   ├── SingleRecipe.js           # Recipe editor
│   └── SingleIngredient.js       # Ingredient editor
├── hooks/                        # Custom React hooks
│   ├── useNavigation.js          # Navigation state management
│   ├── useRecipes.js             # Recipe data operations
│   ├── useIngredients.js         # Ingredient data operations
│   └── useViewState.js           # View state management
├── config/                       # Configuration objects
│   ├── recipeFields.js           # Recipe form field definitions
│   └── ingredientFields.js       # Ingredient form field definitions
├── utils/                        # Utility functions
│   └── navigation.js             # Navigation helper functions
└── constants/                    # App constants
    └── navigation.js             # Navigation constants
```

### WordPress Integration Points

**Custom Post Type**: `bc_recipe`
- Stores recipe data with custom meta fields
- REST API enabled for React integration
- Custom admin columns for recipe management

**Custom Taxonomy**: `bc_ingredient`
- Stores ingredient data with pricing metadata
- Custom term meta for price, quantity, unit
- REST API enabled for ingredient management

**Admin Integration**
- Custom admin page at "Recipes" menu
- React app renders within WordPress admin
- Uses WordPress components and styling

### Development Notes

- Built with `@wordpress/scripts` for build tooling
- Uses WordPress components (`@wordpress/components`, `@wordpress/icons`)
- Follows WordPress coding standards for PHP
- React components use functional components with hooks
- Custom hooks pattern for reusable logic
- Configuration objects separate form definitions from components