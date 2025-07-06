---
globs: *.js

---
# WordPress Development Rules

## Overview
This project is a WordPress plugin that uses React components built with WordPress-specific tooling and build processes.

Do not install react packages directly, only use their WordPress counterparts.

## Key Technologies & Dependencies

### WordPress React Ecosystem
- **@wordpress/element**: WordPress's React wrapper that provides React and ReactDOM
- **@wordpress/components**: WordPress's component library with pre-built UI components
- **@wordpress/scripts**: WordPress's build tool that provides webpack configuration, linting, and build processes

### Build Process
- Uses `@wordpress/scripts` for building, which provides:
  - Webpack configuration optimized for WordPress
  - ESLint with WordPress coding standards
  - Babel transpilation
  - Asset optimization and minification
  - Hot reloading for development

## Development Guidelines

### Component Development
- Use `@wordpress/element` instead of importing React directly
- Leverage `@wordpress/components` for UI elements when possible
- **JSX is allowed and preferred** - use JSX syntax for component development
- Follow WordPress coding standards and naming conventions
- Use WordPress hooks and filters when integrating with WordPress core

### Build Commands
- `npm run build`: Production build
- `npm run dev`: Development build with watch mode
- `npm run start`: Development server with hot reloading
- `npm run lint`: Run ESLint with WordPress standards
- `npm run lint:fix`: Auto-fix linting issues

### WordPress Integration
- Components should be designed to work within WordPress admin context
- Use WordPress data APIs and hooks for state management
- Follow WordPress security best practices
- Ensure compatibility with WordPress version requirements

### File Structure
- Source files in `src/` directory
- Built assets typically output to `build/` or `dist/`
- Follow WordPress plugin structure conventions
- Use proper asset enqueuing in PHP files

### Code Style
- Follow WordPress coding standards
- Use WordPress naming conventions (snake_case for PHP, camelCase for JS)
- Include proper documentation and comments
- Follow WordPress security guidelines

## Common Patterns

### Element Usage
```javascript
import { render } from '@wordpress/element';
import { Button, TextControl } from '@wordpress/components';

// JSX is preferred for component development
const MyComponent = () => (
  <div>
    <Button onClick={handleClick}>Click me</Button>
    <TextControl 
      label="Example"
      value={value}
      onChange={setValue}
    />
  </div>
);
```

### WordPress Data Integration
```javascript
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';

// Use WordPress data stores for state management
const posts = useSelect(select => 
  select(coreDataStore).getEntityRecords('postType', 'post')
);
```

### Build Configuration
- `@wordpress/scripts` handles most configuration automatically
- Custom webpack config can be added via `webpack.config.js`
- Environment variables can be set in `.env` files
- WordPress-specific optimizations are applied automatically

## Debugging & Development
- Use WordPress debug mode for development
- Browser dev tools work normally with React components
- WordPress hooks and filters can be used for debugging
- Check browser console for build errors and warnings
