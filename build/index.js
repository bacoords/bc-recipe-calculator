/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/App.js":
/*!*******************************!*\
  !*** ./src/components/App.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




function App() {
  // Get the current post ID from the WordPress environment
  const postId = window.bcRecipeCalculator?.postId || 0;
  const [servings, setServings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(1);
  const [ingredients, setIngredients] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [totalCost, setTotalCost] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const [costPerServing, setCostPerServing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);

  // New state for taxonomy integration
  const [availableIngredients, setAvailableIngredients] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [isModalOpen, setIsModalOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [newIngredient, setNewIngredient] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    name: "",
    price: "",
    quantity: "",
    unit: ""
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)("");

  // State for saving data
  const [isSaving, setIsSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [lastSaved, setLastSaved] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  // State for price verification
  const [priceChanges, setPriceChanges] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [isCheckingPrices, setIsCheckingPrices] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

  // Fetch ingredients from WordPress taxonomy
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    fetchIngredients();
  }, []);

  // Check for price changes when ingredients are loaded and we have recipe data
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (availableIngredients.length > 0 && ingredients.length > 0) {
      checkForPriceChanges(ingredients);
    }
  }, [availableIngredients, ingredients]);

  // Load recipe data on component mount
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (postId) {
      loadRecipeData();
    }
  }, [postId]);

  // Auto-save recipe data every 1 minute
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (postId && (servings > 0 || ingredients.length > 0)) {
      const intervalId = setInterval(() => {
        saveRecipeData();
      }, 60000); // Auto-save every 1 minute

      return () => clearInterval(intervalId);
    }
  }, [servings, ingredients, postId]);
  const loadRecipeData = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/bc_recipe/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to load recipe data");
      }
      const data = await response.json();
      setServings(data.meta?.recipe_servings || 1);
      const loadedIngredients = data.meta?.recipe_ingredients ? JSON.parse(data.meta.recipe_ingredients) : [];
      setIngredients(loadedIngredients);

      // Load saved cost values
      setTotalCost(data.meta?.total_cost || 0);
      setCostPerServing(data.meta?.cost_per_serving || 0);

      // Check for price changes after loading ingredients
      if (loadedIngredients.length > 0) {
        checkForPriceChanges(loadedIngredients);
      }
    } catch (error) {
      console.error("Error loading recipe data:", error);
      // Don't show error for new recipes that don't have data yet
      if (error.message !== "Failed to load recipe data") {
        setError("Failed to load recipe data");
      }
    }
  };
  const checkForPriceChanges = async recipeIngredients => {
    if (!availableIngredients.length) return;
    setIsCheckingPrices(true);
    const changes = [];
    recipeIngredients.forEach(ingredient => {
      if (ingredient.termId) {
        const currentIngredient = availableIngredients.find(ing => ing.id === ingredient.termId);
        if (currentIngredient) {
          const currentPrice = parseFloat(currentIngredient.meta?.ingredient_price || 0);
          const currentQuantity = parseFloat(currentIngredient.meta?.ingredient_quantity || 0);

          // If we have saved price data, compare it
          if (ingredient.savedPrice !== undefined && ingredient.savedQuantity !== undefined) {
            const savedPrice = parseFloat(ingredient.savedPrice);
            const savedQuantity = parseFloat(ingredient.savedQuantity);
            if (currentPrice !== savedPrice || currentQuantity !== savedQuantity) {
              changes.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                oldPrice: savedPrice,
                newPrice: currentPrice,
                oldQuantity: savedQuantity,
                newQuantity: currentQuantity,
                oldUnitPrice: savedQuantity > 0 ? savedPrice / savedQuantity : 0,
                newUnitPrice: currentQuantity > 0 ? currentPrice / currentQuantity : 0
              });
            }
          }
        }
      }
    });
    setPriceChanges(changes);
    setIsCheckingPrices(false);
  };
  const saveRecipeData = async () => {
    if (!postId) return;
    try {
      setIsSaving(true);

      // Get the title from the WordPress post title field
      const titleElement = document.getElementById("title");
      const title = titleElement ? titleElement.value : "";

      // Save current price data with ingredients
      const ingredientsWithPriceData = ingredients.map(ingredient => {
        if (ingredient.termId) {
          const selectedIngredient = availableIngredients.find(ing => ing.id === ingredient.termId);
          if (selectedIngredient) {
            return {
              ...ingredient,
              savedPrice: selectedIngredient.meta?.ingredient_price || 0,
              savedQuantity: selectedIngredient.meta?.ingredient_quantity || 0
            };
          }
        }
        return ingredient;
      });

      // Get the term IDs of selected ingredients for taxonomy assignment
      const ingredientTermIds = ingredients.filter(ingredient => ingredient.termId).map(ingredient => ingredient.termId);

      // Update the post with title, status, meta data, and taxonomy terms
      const response = await fetch(`/wp-json/wp/v2/bc_recipe/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce
        },
        body: JSON.stringify({
          title: title,
          status: "publish",
          meta: {
            recipe_servings: servings,
            recipe_ingredients: JSON.stringify(ingredientsWithPriceData),
            total_cost: totalCost,
            cost_per_serving: costPerServing
          },
          bc_ingredient: ingredientTermIds
        })
      });
      if (!response.ok) {
        throw new Error("Failed to save recipe data");
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving recipe data:", error);
      setError("Failed to save recipe data");
    } finally {
      setIsSaving(false);
    }
  };
  const fetchIngredients = async () => {
    try {
      setIsLoadingIngredients(true);
      const response = await fetch("/wp-json/wp/v2/bc_ingredient?per_page=100");
      if (!response.ok) {
        throw new Error("Failed to fetch ingredients");
      }
      const ingredients = await response.json();
      setAvailableIngredients(ingredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      setError("Failed to load ingredients");
    } finally {
      setIsLoadingIngredients(false);
    }
  };
  const createNewIngredient = async () => {
    if (!newIngredient.name.trim()) {
      setError("Ingredient name is required");
      return;
    }
    if (!newIngredient.price.trim()) {
      setError("Price is required");
      return;
    }
    if (isNaN(parseFloat(newIngredient.price)) || parseFloat(newIngredient.price) <= 0) {
      setError("Price must be a valid positive number");
      return;
    }
    if (!newIngredient.quantity.trim()) {
      setError("Quantity is required");
      return;
    }
    if (isNaN(parseFloat(newIngredient.quantity)) || parseFloat(newIngredient.quantity) <= 0) {
      setError("Quantity must be a valid positive number");
      return;
    }
    if (!newIngredient.unit.trim()) {
      setError("Unit is required");
      return;
    }
    try {
      setIsCreatingIngredient(true);
      setError("");
      const response = await fetch("/wp-json/wp/v2/bc_ingredient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce
        },
        body: JSON.stringify({
          name: newIngredient.name,
          meta: {
            ingredient_price: newIngredient.price,
            ingredient_quantity: newIngredient.quantity,
            ingredient_unit: newIngredient.unit
          }
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create ingredient");
      }
      const createdIngredient = await response.json();
      setAvailableIngredients([...availableIngredients, createdIngredient]);
      setIsModalOpen(false);
      setNewIngredient({
        name: "",
        price: "",
        quantity: "",
        unit: ""
      });

      // Refresh the ingredients list
      await fetchIngredients();
    } catch (error) {
      console.error("Error creating ingredient:", error);
      setError("Failed to create ingredient");
    } finally {
      setIsCreatingIngredient(false);
    }
  };
  const addIngredient = () => {
    const newIngredient = {
      id: Date.now(),
      termId: null,
      name: "",
      recipeAmount: "",
      cost: 0
    };
    setIngredients([...ingredients, newIngredient]);
  };
  const removeIngredient = id => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id));
  };
  const updateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(ingredient => {
      if (ingredient.id === id) {
        const updated = {
          ...ingredient,
          [field]: value
        };

        // Calculate cost for this ingredient using taxonomy data
        if (updated.termId && updated.recipeAmount) {
          const selectedIngredient = availableIngredients.find(ing => ing.id === updated.termId);
          if (selectedIngredient) {
            const price = parseFloat(selectedIngredient.meta?.ingredient_price || 0);
            const packageAmount = parseFloat(selectedIngredient.meta?.ingredient_quantity || 0);
            const recipeAmount = parseFloat(updated.recipeAmount);
            if (packageAmount > 0) {
              updated.cost = price / packageAmount * recipeAmount;
            } else {
              updated.cost = 0;
            }
          }
        }
        return updated;
      }
      return ingredient;
    }));
  };
  const selectIngredientFromTaxonomy = (id, termId) => {
    const selectedIngredient = availableIngredients.find(ing => ing.id === parseInt(termId));
    if (selectedIngredient) {
      setIngredients(ingredients.map(ingredient => {
        if (ingredient.id === id) {
          const updated = {
            ...ingredient,
            termId: selectedIngredient.id,
            name: selectedIngredient.name
          };

          // Calculate cost for this ingredient using taxonomy data
          if (updated.termId && updated.recipeAmount) {
            const price = parseFloat(selectedIngredient.meta?.ingredient_price || 0);
            const packageAmount = parseFloat(selectedIngredient.meta?.ingredient_quantity || 0);
            const recipeAmount = parseFloat(updated.recipeAmount);
            if (packageAmount > 0) {
              updated.cost = price / packageAmount * recipeAmount;
            } else {
              updated.cost = 0;
            }
          } else {
            updated.cost = 0;
          }
          return updated;
        }
        return ingredient;
      }));
    }
  };

  // Calculate total cost whenever ingredients change
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const total = ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
    setTotalCost(total);
    setCostPerServing(servings > 0 ? total / servings : 0);
  }, [ingredients, servings]);
  const ingredientOptions = availableIngredients.map(ingredient => ({
    label: ingredient.name,
    value: ingredient.id.toString()
  }));
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: "bc-recipe-calculator",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "calculator-header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "header-content",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h2", {
            children: "Recipe Cost Calculator"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
            children: "Calculate the cost of your recipe ingredients"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          className: "save-actions",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            variant: "primary",
            onClick: saveRecipeData,
            isBusy: isSaving,
            disabled: !postId,
            children: isSaving ? "Saving..." : "Save Recipe"
          })
        })]
      }), isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "saving-indicator",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
          children: "Saving..."
        })]
      }), lastSaved && !isSaving && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "saved-indicator",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
          children: ["\u2713 Last saved: ", lastSaved.toLocaleTimeString()]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
          className: "auto-save-note",
          children: "(Auto-saves every minute)"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "calculator-section",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "servings-input",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
          htmlFor: "servings",
          children: "Number of Servings:"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          type: "number",
          value: servings.toString(),
          onChange: value => setServings(parseInt(value) || 1),
          min: "1"
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "calculator-section",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "ingredients-header",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
          children: "Ingredients"
        })
      }), error && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
        status: "error",
        isDismissible: false,
        children: error
      }), isCheckingPrices && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "checking-prices",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          children: "Checking ingredient prices..."
        })]
      }), priceChanges.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
        status: "warning",
        isDismissible: false,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          className: "price-changes-warning",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h4", {
            children: "\u26A0\uFE0F Ingredient prices have changed:"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("ul", {
            children: priceChanges.map((change, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("li", {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
                children: change.name
              }), ": Price changed from $", change.oldPrice.toFixed(2), "for ", change.oldQuantity, " units to $", change.newPrice.toFixed(2), " for ", change.newQuantity, " units.", change.oldUnitPrice !== change.newUnitPrice && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
                className: "unit-price-change",
                children: [" ", "Unit price: $", change.oldUnitPrice.toFixed(2), " \u2192 $", change.newUnitPrice.toFixed(2)]
              })]
            }, index))
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("em", {
              children: "Cost calculations have been updated with the new prices."
            })
          })]
        })
      }), isLoadingIngredients && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "loading-ingredients",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          children: "Loading ingredients..."
        })]
      }), ingredients.length === 0 && !isLoadingIngredients && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "no-ingredients",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          children: "No ingredients added yet. Click \"Add Ingredient\" to get started."
        })
      }), ingredients.map(ingredient => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "ingredient-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          className: "ingredient-fields",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
            className: "field-group",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
              children: "Select Ingredient:"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
              value: ingredient.termId?.toString() || "",
              options: [{
                label: "Choose an ingredient...",
                value: ""
              }, ...ingredientOptions],
              onChange: value => selectIngredientFromTaxonomy(ingredient.id, value)
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
            className: "field-group",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("label", {
              children: ["Amount Used in Recipe (", ingredient.termId ? availableIngredients.find(ing => ing.id === ingredient.termId)?.meta?.ingredient_unit || "units" : "units", "):"]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
              type: "number",
              step: "0.01",
              value: ingredient.recipeAmount,
              onChange: value => updateIngredient(ingredient.id, "recipeAmount", value),
              placeholder: "0"
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
            className: "field-group cost-display",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
              children: "Cost:"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
              className: "cost-value",
              children: ["$", ingredient.cost.toFixed(2)]
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isDestructive: true,
          onClick: () => removeIngredient(ingredient.id),
          children: "Remove"
        })]
      }, ingredient.id)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "ingredient-actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "primary",
          onClick: addIngredient,
          children: "+ Add Ingredient"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          onClick: () => setIsModalOpen(true),
          children: "+ Create New Ingredient"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "calculator-section results",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
        children: "Cost Summary"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "cost-summary",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          className: "cost-item",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
            className: "cost-label",
            children: "Total Recipe Cost:"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
            className: "cost-value total",
            children: ["$", totalCost.toFixed(2)]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          className: "cost-item",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
            className: "cost-label",
            children: "Cost per Serving:"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
            className: "cost-value per-serving",
            children: ["$", costPerServing.toFixed(2)]
          })]
        })]
      })]
    }), isModalOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Modal, {
      title: "Create New Ingredient",
      onRequestClose: () => setIsModalOpen(false),
      className: "ingredient-modal",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "modal-content",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
          style: {
            margin: "0 0 16px 0",
            fontSize: "13px",
            color: "#646970"
          },
          children: "Create a new ingredient with pricing information. This will be available for all recipes."
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Ingredient Name *",
          value: newIngredient.name,
          onChange: value => setNewIngredient({
            ...newIngredient,
            name: value
          }),
          placeholder: "e.g., All-purpose flour",
          required: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Price per Unit ($) *",
          type: "number",
          step: "0.01",
          min: "0.01",
          value: newIngredient.price,
          onChange: value => setNewIngredient({
            ...newIngredient,
            price: value
          }),
          placeholder: "0.00",
          required: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Default Quantity *",
          type: "number",
          step: "0.01",
          min: "0.01",
          value: newIngredient.quantity,
          onChange: value => setNewIngredient({
            ...newIngredient,
            quantity: value
          }),
          placeholder: "0",
          required: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: "Unit *",
          value: newIngredient.unit,
          onChange: value => setNewIngredient({
            ...newIngredient,
            unit: value
          }),
          placeholder: "e.g., grams, cups, oz",
          required: true
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "modal-actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "primary",
          onClick: createNewIngredient,
          isBusy: isCreatingIngredient,
          disabled: !newIngredient.name.trim() || !newIngredient.price.trim() || !newIngredient.quantity.trim() || !newIngredient.unit.trim() || isNaN(parseFloat(newIngredient.price)) || parseFloat(newIngredient.price) <= 0 || isNaN(parseFloat(newIngredient.quantity)) || parseFloat(newIngredient.quantity) <= 0,
          children: isCreatingIngredient ? "Creating..." : "Create Ingredient"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          variant: "secondary",
          onClick: () => setIsModalOpen(false),
          disabled: isCreatingIngredient,
          children: "Cancel"
        })]
      })]
    })]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/App */ "./src/components/App.js");
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./style.scss */ "./src/style.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




// Wait for DOM to be ready

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("postbox-container-2");
  if (container) {
    const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createRoot)(container);
    root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_components_App__WEBPACK_IMPORTED_MODULE_1__["default"], {}));
  }
});

/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"index": 0,
/******/ 			"./style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkbc_recipe_calculator"] = globalThis["webpackChunkbc_recipe_calculator"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["./style-index"], () => (__webpack_require__("./src/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map