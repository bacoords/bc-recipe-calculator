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

function SinglePackaging({ termId }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load packaging data on component mount
  useEffect(() => {
    if (termId) {
      loadPackagingData();
    }
  }, [termId]);

  const loadPackagingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/wp-json/wp/v2/bc_packaging/${termId}`);
      if (!response.ok) {
        throw new Error("Failed to load packaging data");
      }
      const data = await response.json();

      setName(data.name || "");
      setPrice(data.meta?.packaging_price || "");
      setQuantity(data.meta?.packaging_quantity || "");
      setUnit(data.meta?.packaging_unit || "");
    } catch (error) {
      console.error("Error loading packaging data:", error);
      setError("Failed to load packaging data");
    } finally {
      setIsLoading(false);
    }
  };

  const savePackagingData = async () => {
    if (!termId) return;

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`/wp-json/wp/v2/bc_packaging/${termId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify({
          name: name,
          meta: {
            packaging_price: price,
            packaging_quantity: quantity,
            packaging_unit: unit,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save packaging data");
      }

      console.log("Packaging saved successfully");
    } catch (error) {
      console.error("Error saving packaging data:", error);
      setError("Failed to save packaging data");
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
          onClick={savePackagingData}
          isBusy={isSaving}
          disabled={!termId}
        >
          {isSaving ? "Saving..." : "Save Packaging"}
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
              label="Packaging Name"
              value={name}
              onChange={(value) => setName(value)}
              placeholder="Packaging Name"
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
              placeholder="e.g., pieces, boxes, containers"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default SinglePackaging;
