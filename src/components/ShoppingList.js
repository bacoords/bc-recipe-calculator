import { useState, useEffect, useMemo } from "@wordpress/element";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  FlexBlock,
  TextControl,
  Spinner,
  Notice,
  __experimentalGrid as Grid,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useEntityRecords } from "@wordpress/core-data";
import { Icon } from "@wordpress/components";
import { chevronUp, chevronDown } from "@wordpress/icons";

function ShoppingList() {
  const [recipeCounts, setRecipeCounts] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);

  // Fetch all recipes
  const { hasResolved, records } = useEntityRecords("postType", "bc_recipe", {
    per_page: 100,
    _embed: "author",
  });

  // Fetch ingredients from taxonomy
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/wp-json/wp/v2/bc_ingredient?per_page=100");
      if (!response.ok) {
        throw new Error("Failed to fetch ingredients");
      }
      const ingredients = await response.json();
      setAvailableIngredients(ingredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Calculate shopping list when recipe counts change
  useEffect(() => {
    if (records && records.length > 0) {
      calculateShoppingList();
    }
  }, [recipeCounts, records]);

  const calculateShoppingList = () => {
    const ingredientMap = new Map();

    records.forEach((recipe) => {
      const count = recipeCounts[recipe.id] || 0;
      if (count > 0) {
        try {
          const ingredients = recipe.meta?.recipe_ingredients
            ? JSON.parse(recipe.meta.recipe_ingredients)
            : [];

          ingredients.forEach((ingredient) => {
            const key = ingredient.termId || ingredient.name;
            if (key) {
              // Get unit from ingredient taxonomy data
              let unit = "units";
              let packageQuantity = 0;
              let packagePrice = 0;

              if (ingredient.termId) {
                const ingredientData = availableIngredients.find(
                  (ing) => ing.id === ingredient.termId
                );
                if (ingredientData) {
                  unit = ingredientData.meta?.ingredient_unit || "units";
                  packageQuantity =
                    ingredientData.meta?.ingredient_quantity || 0;
                  packagePrice = ingredientData.meta?.ingredient_price || 0;
                }
              }

              const existing = ingredientMap.get(key) || {
                name: ingredient.name,
                termId: ingredient.termId,
                totalAmount: 0,
                recipeAmount: ingredient.recipeAmount,
                unit: unit,
                packageQuantity: packageQuantity,
                packagePrice: packagePrice,
                recipes: [],
              };

              // Parse the recipe amount
              const amount = parseFloat(ingredient.recipeAmount) || 0;
              const totalForThisRecipe = amount * count;

              existing.totalAmount += totalForThisRecipe;
              existing.recipes.push({
                recipeName: recipe.title?.rendered || recipe.title?.raw || "",
                count: count,
                amount: amount,
                total: totalForThisRecipe,
              });

              ingredientMap.set(key, existing);
            }
          });
        } catch (error) {
          console.error(
            "Error parsing ingredients for recipe:",
            recipe.id,
            error
          );
        }
      }
    });

    setShoppingList(Array.from(ingredientMap.values()));
  };

  const incrementRecipe = (recipeId) => {
    setRecipeCounts((prev) => ({
      ...prev,
      [recipeId]: (prev[recipeId] || 0) + 1,
    }));
  };

  const decrementRecipe = (recipeId) => {
    setRecipeCounts((prev) => ({
      ...prev,
      [recipeId]: Math.max(0, (prev[recipeId] || 0) - 1),
    }));
  };

  const getTotalRecipes = () => {
    return Object.values(recipeCounts).reduce((sum, count) => sum + count, 0);
  };

  if (!hasResolved) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{__("Shopping List", "bc-recipe-calculator")}</h2>

      <Grid columns={2} gap={4} className="shopping-list-grid">
        {/* Recipe Selection */}
        <Card>
          <CardHeader>
            <h3>{__("Select Recipes", "bc-recipe-calculator")}</h3>
            <p>
              {__("Total recipes selected:", "bc-recipe-calculator")}{" "}
              {getTotalRecipes()}
            </p>
          </CardHeader>
          <CardBody>
            {records && records.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {records.map((recipe) => {
                  const count = recipeCounts[recipe.id] || 0;
                  return (
                    <Card key={recipe.id} style={{ padding: "1rem" }}>
                      <Flex align="center" justify="space-between">
                        <FlexBlock>
                          <h4 style={{ margin: "0 0 0.5rem 0" }}>
                            {recipe.title?.rendered || recipe.title?.raw || ""}
                          </h4>
                          <p
                            style={{
                              margin: 0,
                              color: "#666",
                              fontSize: "0.9em",
                            }}
                          >
                            {__("Servings:", "bc-recipe-calculator")}{" "}
                            {recipe.meta?.recipe_servings || 1}
                          </p>
                        </FlexBlock>
                        <FlexItem>
                          <Flex align="center" gap={2}>
                            <Button
                              variant="secondary"
                              icon={<Icon icon={chevronDown} />}
                              onClick={() => decrementRecipe(recipe.id)}
                              disabled={count === 0}
                            />
                            <span
                              style={{ minWidth: "2rem", textAlign: "center" }}
                            >
                              {count}
                            </span>
                            <Button
                              variant="secondary"
                              icon={<Icon icon={chevronUp} />}
                              onClick={() => incrementRecipe(recipe.id)}
                            />
                          </Flex>
                        </FlexItem>
                      </Flex>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Notice status="info">
                {__("No recipes found.", "bc-recipe-calculator")}
              </Notice>
            )}
          </CardBody>
        </Card>

        {/* Shopping List */}
        <Card>
          <CardHeader>
            <h3>{__("Shopping List", "bc-recipe-calculator")}</h3>
            <p>
              {__("Ingredients needed:", "bc-recipe-calculator")}{" "}
              {shoppingList.length}
            </p>
          </CardHeader>
          <CardBody>
            {shoppingList.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {shoppingList.map((ingredient, index) => (
                  <Card key={index} style={{ padding: "1rem" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0" }}>
                        {ingredient.name}
                        {" - "}
                        {ingredient.totalAmount} {ingredient.unit}
                      </h4>
                      {ingredient.packageQuantity > 0 && (
                        <p
                          style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}
                        >
                          {__("Packages to buy:", "bc-recipe-calculator")}{" "}
                          {Math.ceil(
                            ingredient.totalAmount / ingredient.packageQuantity
                          )}
                          {__(" (", "bc-recipe-calculator")}
                          {ingredient.packageQuantity} {ingredient.unit} per
                          package at ${ingredient.packagePrice}
                          {__(")", "bc-recipe-calculator")}
                        </p>
                      )}
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        <details style={{ margin: "0 0 0.25rem 0" }}>
                          <summary>
                            {__("From recipes:", "bc-recipe-calculator")}
                          </summary>
                          <ul
                            style={{
                              margin: "0 0 0.5rem 0",
                              paddingLeft: "1.5rem",
                            }}
                          >
                            {ingredient.recipes.map((recipe, recipeIndex) => (
                              <li key={recipeIndex}>
                                {recipe.recipeName} ({recipe.count}x) -{" "}
                                {recipe.amount} {ingredient.unit} each ={" "}
                                {recipe.total} {ingredient.unit}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Notice status="info">
                {__(
                  "Select recipes to generate your shopping list.",
                  "bc-recipe-calculator"
                )}
              </Notice>
            )}
          </CardBody>
        </Card>
      </Grid>
    </div>
  );
}

export default ShoppingList;
