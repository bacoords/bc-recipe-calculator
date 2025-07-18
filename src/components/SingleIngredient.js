import { useState, useEffect } from "@wordpress/element";
import {
  Button,
  TextControl,
  Spinner,
  Notice,
  Card,
  CardBody,
  Flex,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

function SingleIngredient({ termId }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load ingredient data on component mount
  useEffect(() => {
    if (termId) {
      loadIngredientData();
    }
  }, [termId]);

  const loadIngredientData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/wp-json/wp/v2/bc_ingredient/${termId}`);
      if (!response.ok) {
        throw new Error("Failed to load ingredient data");
      }
      const data = await response.json();

      setName(data.name || "");
      setPrice(data.meta?.ingredient_price || "");
      setQuantity(data.meta?.ingredient_quantity || "");
      setUnit(data.meta?.ingredient_unit || "");
    } catch (error) {
      console.error("Error loading ingredient data:", error);
      setError("Failed to load ingredient data");
    } finally {
      setIsLoading(false);
    }
  };

  const saveIngredientData = async () => {
    if (!termId) return;

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`/wp-json/wp/v2/bc_ingredient/${termId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify({
          name: name,
          meta: {
            ingredient_price: price,
            ingredient_quantity: quantity,
            ingredient_unit: unit,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save ingredient data");
      }

      console.log("Ingredient saved successfully");
    } catch (error) {
      console.error("Error saving ingredient data:", error);
      setError("Failed to save ingredient data");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <Spinner />
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

      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "1rem" }}
      >
        <h1>{name}</h1>
        <Button
          variant="primary"
          onClick={saveIngredientData}
          isBusy={isSaving}
          disabled={!termId}
        >
          {isSaving ? "Saving..." : "Save Ingredient"}
        </Button>
      </Flex>

      <Card>
        <CardBody>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <TextControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label="Ingredient Name"
              value={name}
              onChange={(value) => setName(value)}
              placeholder="Ingredient Name"
            />

            <TextControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              type="number"
              step="0.01"
              min="0.01"
              label="Price per Package ($)"
              value={price}
              onChange={(value) => setPrice(value)}
              placeholder="0.00"
            />

            <TextControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              type="number"
              step="0.01"
              min="0.01"
              label="Quantity per Package"
              value={quantity}
              onChange={(value) => setQuantity(value)}
              placeholder="0"
            />

            <TextControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label="Unit of Measurement"
              value={unit}
              onChange={(value) => setUnit(value)}
              placeholder="e.g., grams, cups, oz"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default SingleIngredient;
