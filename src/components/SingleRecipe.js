import { useState, useEffect } from "@wordpress/element";
import {
  Button,
  TextControl,
  SelectControl,
  Spinner,
  Notice,
  Card,
  CardHeader,
  Flex,
  FlexItem,
  FlexBlock,
  __experimentalGrid as Grid,
  CardBody,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useDispatch } from "@wordpress/data";
import { store as coreDataStore, useEntityRecord } from "@wordpress/core-data";
import CreateIngredientModal from "./CreateIngredientModal";

function SingleRecipe({ postId: propPostId }) {
  // Get the post ID from props or from the WordPress environment
  const postId = propPostId || window.bcRecipeCalculator?.postId || 0;

  // Get the save function from the data store
  const { saveEditedEntityRecord, editEntityRecord } =
    useDispatch(coreDataStore);
  
  // Use useEntityRecord for proper data fetching
  const { record: recipeData, hasResolved } = useEntityRecord(
    "postType",
    "bc_recipe",
    postId
  );

  const [title, setTitle] = useState("");
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [costPerServing, setCostPerServing] = useState(0);

  // New state for taxonomy integration
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for saving data
  const [isSaving, setIsSaving] = useState(false);

  // State for price verification
  const [priceChanges, setPriceChanges] = useState([]);
  const [isCheckingPrices, setIsCheckingPrices] = useState(false);

  // Fetch ingredients from WordPress taxonomy
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Check for price changes when ingredients are loaded and we have recipe data
  useEffect(() => {
    if (availableIngredients.length > 0 && ingredients.length > 0) {
      checkForPriceChanges(ingredients);
    }
  }, [availableIngredients, ingredients]);

  // Load recipe data when it becomes available
  useEffect(() => {
    if (hasResolved && recipeData) {
      setServings(recipeData.meta?.recipe_servings || 1);
      const loadedIngredients = recipeData.meta?.recipe_ingredients
        ? JSON.parse(recipeData.meta.recipe_ingredients)
        : [];
      setIngredients(loadedIngredients);
      setTitle(recipeData.title?.rendered || recipeData.title?.raw || "");
      // Load saved cost values
      setTotalCost(recipeData.meta?.total_cost || 0);
      setCostPerServing(recipeData.meta?.cost_per_serving || 0);

      // Check for price changes after loading ingredients
      if (loadedIngredients.length > 0) {
        checkForPriceChanges(loadedIngredients);
      }
    } else if (hasResolved && !recipeData) {
      setError(__("Failed to load recipe data. Please try again."));
    }
  }, [hasResolved, recipeData]);

  const checkForPriceChanges = async (recipeIngredients) => {
    if (!availableIngredients.length) return;

    setIsCheckingPrices(true);
    const changes = [];

    recipeIngredients.forEach((ingredient) => {
      if (ingredient.termId) {
        const currentIngredient = availableIngredients.find(
          (ing) => ing.id === ingredient.termId
        );

        if (currentIngredient) {
          const currentPrice = parseFloat(
            currentIngredient.meta?.ingredient_price || 0
          );
          const currentQuantity = parseFloat(
            currentIngredient.meta?.ingredient_quantity || 0
          );

          // If we have saved price data, compare it
          if (
            ingredient.savedPrice !== undefined &&
            ingredient.savedQuantity !== undefined
          ) {
            const savedPrice = parseFloat(ingredient.savedPrice);
            const savedQuantity = parseFloat(ingredient.savedQuantity);

            if (
              currentPrice !== savedPrice ||
              currentQuantity !== savedQuantity
            ) {
              changes.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                oldPrice: savedPrice,
                newPrice: currentPrice,
                oldQuantity: savedQuantity,
                newQuantity: currentQuantity,
                oldUnitPrice:
                  savedQuantity > 0 ? savedPrice / savedQuantity : 0,
                newUnitPrice:
                  currentQuantity > 0 ? currentPrice / currentQuantity : 0,
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

      // Save current price data with ingredients
      const ingredientsWithPriceData = ingredients.map((ingredient) => {
        if (ingredient.termId) {
          const selectedIngredient = availableIngredients.find(
            (ing) => ing.id === ingredient.termId
          );
          if (selectedIngredient) {
            return {
              ...ingredient,
              savedPrice: selectedIngredient.meta?.ingredient_price || 0,
              savedQuantity: selectedIngredient.meta?.ingredient_quantity || 0,
            };
          }
        }
        return ingredient;
      });

      // Get the term IDs of selected ingredients for taxonomy assignment
      const ingredientTermIds = ingredients
        .filter((ingredient) => ingredient.termId)
        .map((ingredient) => ingredient.termId);

      // Update the entity record in the store
      editEntityRecord("postType", "bc_recipe", postId, {
        title: title,
        status: "publish",
        meta: {
          recipe_servings: servings,
          recipe_ingredients: JSON.stringify(ingredientsWithPriceData),
          total_cost: totalCost,
          cost_per_serving: costPerServing,
        },
        bc_ingredient: ingredientTermIds,
      });

      // Save the edited entity record
      await saveEditedEntityRecord("postType", "bc_recipe", postId);
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

  const handleIngredientCreated = async (createdIngredient) => {
    // Add the new ingredient to the available ingredients list
    setAvailableIngredients([...availableIngredients, createdIngredient]);

    // Refresh the ingredients list
    await fetchIngredients();
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

  // Show loading state while data is being fetched
  if (!hasResolved) {
    return (
      <div className="bc-recipe-calculator" style={{ padding: "1rem", textAlign: "center" }}>
        <Spinner />
        <p>Loading recipe data...</p>
      </div>
    );
  }

  return (
    <div className="bc-recipe-calculator" style={{ padding: "1rem" }}>
      {isSaving && (
        <Notice status="info" isDismissible={false}>
          <div className="saving-indicator">
            <Spinner />
            <span>Saving...</span>
          </div>
        </Notice>
      )}

      {error && (
        <Notice status="error" isDismissible={false}>
          {error}
        </Notice>
      )}

      {isCheckingPrices && (
        <div className="checking-prices">
          <Spinner />
          <p>Checking ingredient prices...</p>
        </div>
      )}

      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "1rem" }}
        className="recipe-title"
      >
        <h1>{title}</h1>
        <Button
          variant="primary"
          onClick={saveRecipeData}
          isBusy={isSaving}
          disabled={!postId}
        >
          {isSaving ? "Saving..." : "Save Recipe"}
        </Button>
      </Flex>
      <Card>
        <CardBody>
          <div>
            <Grid
              templateColumns="75% 25%"
              align="center"
              style={{ marginBlock: "1rem" }}
              className="recipe-title-servings"
            >
              <TextControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label="Recipe Title"
                value={title}
                onChange={(value) => setTitle(value)}
                placeholder="Recipe Title"
              />

              <TextControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                type="number"
                label="Number of Servings"
                placeholder="1"
                value={servings.toString()}
                onChange={(value) => setServings(parseInt(value) || 1)}
                min="1"
              />
            </Grid>

            {priceChanges.length > 0 && (
              <Notice status="warning" isDismissible={false}>
                <div className="price-changes-warning">
                  <h4>⚠️ Ingredient prices have changed:</h4>
                  <ul>
                    {priceChanges.map((change, index) => (
                      <li key={index}>
                        <strong>{change.name}</strong>: Price changed from $
                        {change.oldPrice.toFixed(2)}
                        for {change.oldQuantity} units to $
                        {change.newPrice.toFixed(2)} for {change.newQuantity}{" "}
                        units.
                        {change.oldUnitPrice !== change.newUnitPrice && (
                          <span className="unit-price-change">
                            {" "}
                            Unit price: ${change.oldUnitPrice.toFixed(2)} → $
                            {change.newUnitPrice.toFixed(2)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <em>
                      Cost calculations have been updated with the new prices.
                    </em>
                  </p>
                </div>
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
                  No ingredients added yet. Click "Add Ingredient" to get
                  started.
                </p>
              </div>
            )}
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="ingredient-row"
                style={{ marginBottom: "1rem" }}
              >
                <Grid
                  templateColumns="40% 40% 20%"
                  align="center"
                  className="grid-ingredient"
                >
                  <SelectControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    value={ingredient.termId?.toString() || ""}
                    label="Select Ingredient:"
                    options={[
                      { label: "Choose an ingredient...", value: "" },
                      ...ingredientOptions,
                    ]}
                    onChange={(value) =>
                      selectIngredientFromTaxonomy(ingredient.id, value)
                    }
                  />
                  <TextControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label={
                      "Amount Used in Recipe (" +
                      (ingredient.termId
                        ? availableIngredients.find(
                            (ing) => ing.id === ingredient.termId
                          )?.meta?.ingredient_unit || "units"
                        : "units") +
                      ")"
                    }
                    type="number"
                    step="0.01"
                    value={ingredient.recipeAmount}
                    onChange={(value) =>
                      updateIngredient(ingredient.id, "recipeAmount", value)
                    }
                    placeholder="0"
                  />

                  <div>
                    <span className="cost-value">
                      ${ingredient.cost.toFixed(2)}
                    </span>

                    <Button
                      isDestructive
                      onClick={() => removeIngredient(ingredient.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Grid>
              </div>
            ))}

            <Flex justify="flex-end" style={{ marginBlock: "1rem" }}>
              <Button variant="primary" onClick={addIngredient}>
                + Add Ingredient
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                + Create New Ingredient
              </Button>
            </Flex>
          </div>

          <Grid columns={2}>
            <Card>
              <CardHeader>
                <h4>Total Recipe Cost</h4>
              </CardHeader>
              <CardBody>
                <span className="cost-value total">
                  ${totalCost.toFixed(2)}
                </span>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h4>Cost per Serving</h4>
              </CardHeader>
              <CardBody>
                <span className="cost-value per-serving">
                  ${costPerServing.toFixed(2)}
                </span>
              </CardBody>
            </Card>
          </Grid>
        </CardBody>
      </Card>

      <CreateIngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIngredientCreated={handleIngredientCreated}
      />
    </div>
  );
}

export default SingleRecipe;
