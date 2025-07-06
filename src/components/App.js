import { useState, useEffect } from "@wordpress/element";
import {
  Button,
  TextControl,
  Modal,
  SelectControl,
  Spinner,
  Notice,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

function App() {
  // Get the current post ID from the WordPress environment
  const postId = window.bcRecipeCalculator?.postId || 0;

  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [costPerServing, setCostPerServing] = useState(0);

  // New state for taxonomy integration
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
  const [error, setError] = useState("");

  // State for saving data
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Fetch ingredients from WordPress taxonomy
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Load recipe data on component mount
  useEffect(() => {
    if (postId) {
      loadRecipeData();
    }
  }, [postId]);

  // Auto-save recipe data every 1 minute
  useEffect(() => {
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
      setIngredients(
        data.meta?.recipe_ingredients
          ? JSON.parse(data.meta.recipe_ingredients)
          : []
      );
    } catch (error) {
      console.error("Error loading recipe data:", error);
      // Don't show error for new recipes that don't have data yet
      if (error.message !== "Failed to load recipe data") {
        setError("Failed to load recipe data");
      }
    }
  };

  const saveRecipeData = async () => {
    if (!postId) return;

    try {
      setIsSaving(true);

      // Get the title from the WordPress post title field
      const titleElement = document.getElementById("title");
      const title = titleElement ? titleElement.value : "";

      // Update the post with title, status, and meta data
      const response = await fetch(`/wp-json/wp/v2/bc_recipe/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify({
          title: title,
          status: "publish",
          meta: {
            recipe_servings: servings,
            recipe_ingredients: JSON.stringify(ingredients),
          },
        }),
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

    if (
      isNaN(parseFloat(newIngredient.price)) ||
      parseFloat(newIngredient.price) <= 0
    ) {
      setError("Price must be a valid positive number");
      return;
    }

    if (!newIngredient.quantity.trim()) {
      setError("Quantity is required");
      return;
    }

    if (
      isNaN(parseFloat(newIngredient.quantity)) ||
      parseFloat(newIngredient.quantity) <= 0
    ) {
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
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify({
          name: newIngredient.name,
          meta: {
            ingredient_price: newIngredient.price,
            ingredient_quantity: newIngredient.quantity,
            ingredient_unit: newIngredient.unit,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ingredient");
      }

      const createdIngredient = await response.json();
      setAvailableIngredients([...availableIngredients, createdIngredient]);
      setIsModalOpen(false);
      setNewIngredient({ name: "", price: "", quantity: "", unit: "" });

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
      cost: 0,
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter((ingredient) => ingredient.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(
      ingredients.map((ingredient) => {
        if (ingredient.id === id) {
          const updated = { ...ingredient, [field]: value };

          // Calculate cost for this ingredient using taxonomy data
          if (updated.termId && updated.recipeAmount) {
            const selectedIngredient = availableIngredients.find(
              (ing) => ing.id === updated.termId
            );
            if (selectedIngredient) {
              const price = parseFloat(
                selectedIngredient.meta?.ingredient_price || 0
              );
              const packageAmount = parseFloat(
                selectedIngredient.meta?.ingredient_quantity || 0
              );
              const recipeAmount = parseFloat(updated.recipeAmount);

              if (packageAmount > 0) {
                updated.cost = (price / packageAmount) * recipeAmount;
              } else {
                updated.cost = 0;
              }
            }
          }

          return updated;
        }
        return ingredient;
      })
    );
  };

  const selectIngredientFromTaxonomy = (id, termId) => {
    const selectedIngredient = availableIngredients.find(
      (ing) => ing.id === parseInt(termId)
    );
    if (selectedIngredient) {
      setIngredients(
        ingredients.map((ingredient) => {
          if (ingredient.id === id) {
            const updated = {
              ...ingredient,
              termId: selectedIngredient.id,
              name: selectedIngredient.name,
            };

            // Calculate cost for this ingredient using taxonomy data
            if (updated.termId && updated.recipeAmount) {
              const price = parseFloat(
                selectedIngredient.meta?.ingredient_price || 0
              );
              const packageAmount = parseFloat(
                selectedIngredient.meta?.ingredient_quantity || 0
              );
              const recipeAmount = parseFloat(updated.recipeAmount);

              if (packageAmount > 0) {
                updated.cost = (price / packageAmount) * recipeAmount;
              } else {
                updated.cost = 0;
              }
            } else {
              updated.cost = 0;
            }

            return updated;
          }
          return ingredient;
        })
      );
    }
  };

  // Calculate total cost whenever ingredients change
  useEffect(() => {
    const total = ingredients.reduce(
      (sum, ingredient) => sum + ingredient.cost,
      0
    );
    setTotalCost(total);
    setCostPerServing(servings > 0 ? total / servings : 0);
  }, [ingredients, servings]);

  const ingredientOptions = availableIngredients.map((ingredient) => ({
    label: ingredient.name,
    value: ingredient.id.toString(),
  }));

  return (
    <div className="bc-recipe-calculator">
      <div className="calculator-header">
        <div className="header-content">
          <div>
            <h2>Recipe Cost Calculator</h2>
            <p>Calculate the cost of your recipe ingredients</p>
          </div>
          <div className="save-actions">
            <Button
              variant="primary"
              onClick={saveRecipeData}
              isBusy={isSaving}
              disabled={!postId}
            >
              {isSaving ? "Saving..." : "Save Recipe"}
            </Button>
          </div>
        </div>
        {isSaving && (
          <div className="saving-indicator">
            <Spinner />
            <span>Saving...</span>
          </div>
        )}
        {lastSaved && !isSaving && (
          <div className="saved-indicator">
            <span>✓ Last saved: {lastSaved.toLocaleTimeString()}</span>
            <span className="auto-save-note">(Auto-saves every minute)</span>
          </div>
        )}
      </div>

      <div className="calculator-section">
        <div className="servings-input">
          <label htmlFor="servings">Number of Servings:</label>
          <TextControl
            type="number"
            value={servings.toString()}
            onChange={(value) => setServings(parseInt(value) || 1)}
            min="1"
          />
        </div>
      </div>

      <div className="calculator-section">
        <div className="ingredients-header">
          <h3>Ingredients</h3>
        </div>

        {error && (
          <Notice status="error" isDismissible={false}>
            {error}
          </Notice>
        )}

        {isLoadingIngredients && (
          <div className="loading-ingredients">
            <Spinner />
            <p>Loading ingredients...</p>
          </div>
        )}

        {ingredients.length === 0 && !isLoadingIngredients && (
          <div className="no-ingredients">
            <p>
              No ingredients added yet. Click "Add Ingredient" to get started.
            </p>
          </div>
        )}

        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="ingredient-row">
            <div className="ingredient-fields">
              <div className="field-group">
                <label>Select Ingredient:</label>
                <SelectControl
                  value={ingredient.termId?.toString() || ""}
                  options={[
                    { label: "Choose an ingredient...", value: "" },
                    ...ingredientOptions,
                  ]}
                  onChange={(value) =>
                    selectIngredientFromTaxonomy(ingredient.id, value)
                  }
                />
              </div>

              <div className="field-group">
                <label>
                  Amount Used in Recipe (
                  {ingredient.termId
                    ? availableIngredients.find(
                        (ing) => ing.id === ingredient.termId
                      )?.meta?.ingredient_unit || "units"
                    : "units"}
                  ):
                </label>
                <TextControl
                  type="number"
                  step="0.01"
                  value={ingredient.recipeAmount}
                  onChange={(value) =>
                    updateIngredient(ingredient.id, "recipeAmount", value)
                  }
                  placeholder="0"
                />
              </div>

              <div className="field-group cost-display">
                <label>Cost:</label>
                <span className="cost-value">
                  ${ingredient.cost.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              isDestructive
              onClick={() => removeIngredient(ingredient.id)}
            >
              Remove
            </Button>
          </div>
        ))}

        <div className="ingredient-actions">
          <Button variant="primary" onClick={addIngredient}>
            + Add Ingredient
          </Button>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            + Create New Ingredient
          </Button>
        </div>
      </div>

      <div className="calculator-section results">
        <h3>Cost Summary</h3>
        <div className="cost-summary">
          <div className="cost-item">
            <span className="cost-label">Total Recipe Cost:</span>
            <span className="cost-value total">${totalCost.toFixed(2)}</span>
          </div>
          <div className="cost-item">
            <span className="cost-label">Cost per Serving:</span>
            <span className="cost-value per-serving">
              ${costPerServing.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          title="Create New Ingredient"
          onRequestClose={() => setIsModalOpen(false)}
          className="ingredient-modal"
        >
          <div className="modal-content">
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "13px",
                color: "#646970",
              }}
            >
              Create a new ingredient with pricing information. This will be
              available for all recipes.
            </p>

            <TextControl
              label="Ingredient Name *"
              value={newIngredient.name}
              onChange={(value) =>
                setNewIngredient({ ...newIngredient, name: value })
              }
              placeholder="e.g., All-purpose flour"
              required
            />

            <TextControl
              label="Price per Unit ($) *"
              type="number"
              step="0.01"
              min="0.01"
              value={newIngredient.price}
              onChange={(value) =>
                setNewIngredient({ ...newIngredient, price: value })
              }
              placeholder="0.00"
              required
            />

            <TextControl
              label="Default Quantity *"
              type="number"
              step="0.01"
              min="0.01"
              value={newIngredient.quantity}
              onChange={(value) =>
                setNewIngredient({ ...newIngredient, quantity: value })
              }
              placeholder="0"
              required
            />

            <TextControl
              label="Unit *"
              value={newIngredient.unit}
              onChange={(value) =>
                setNewIngredient({ ...newIngredient, unit: value })
              }
              placeholder="e.g., grams, cups, oz"
              required
            />
          </div>

          <div className="modal-actions">
            <Button
              variant="primary"
              onClick={createNewIngredient}
              isBusy={isCreatingIngredient}
              disabled={
                !newIngredient.name.trim() ||
                !newIngredient.price.trim() ||
                !newIngredient.quantity.trim() ||
                !newIngredient.unit.trim() ||
                isNaN(parseFloat(newIngredient.price)) ||
                parseFloat(newIngredient.price) <= 0 ||
                isNaN(parseFloat(newIngredient.quantity)) ||
                parseFloat(newIngredient.quantity) <= 0
              }
            >
              {isCreatingIngredient ? "Creating..." : "Create Ingredient"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isCreatingIngredient}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
