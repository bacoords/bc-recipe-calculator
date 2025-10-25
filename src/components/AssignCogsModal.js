import { useState, useEffect } from "@wordpress/element";
import {
  Button,
  TextControl,
  Modal,
  Notice,
  Flex,
  SelectControl,
  Spinner,
  Card,
  CardBody,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

function AssignCogsModal({ isOpen, onClose, totalCost, costPerServing }) {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [variations, setVariations] = useState([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [currentCogs, setCurrentCogs] = useState(null);
  const [newCogsValue, setNewCogsValue] = useState(totalCost.toFixed(2));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      // Reset new COGS value to total cost when modal opens
      setNewCogsValue(totalCost.toFixed(2));
    }
  }, [isOpen, totalCost]);

  // Fetch variations when a variable product is selected
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === parseInt(selectedProductId));
      if (product && product.type === "variable") {
        fetchVariations(selectedProductId);
        setSelectedVariationId("");
        setCurrentCogs(null);
      } else if (product) {
        // Simple product selected
        setVariations([]);
        setSelectedVariationId("");
        fetchCurrentCogs(selectedProductId, null);
      }
    } else {
      setVariations([]);
      setSelectedVariationId("");
      setCurrentCogs(null);
    }
  }, [selectedProductId, products]);

  // Fetch current COGS when variation is selected
  useEffect(() => {
    if (selectedVariationId && selectedProductId) {
      fetchCurrentCogs(selectedProductId, selectedVariationId);
    }
  }, [selectedVariationId, selectedProductId]);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setError("");
      const response = await fetch("/wp-json/wc/v3/products?per_page=100", {
        headers: {
          "X-WP-Nonce": wpApiSettings.nonce,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const productsData = await response.json();
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        "Failed to load WooCommerce products. Make sure WooCommerce is installed and activated."
      );
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchVariations = async (productId) => {
    try {
      setIsLoadingVariations(true);
      const response = await fetch(
        `/wp-json/wc/v3/products/${productId}/variations?per_page=100`,
        {
          headers: {
            "X-WP-Nonce": wpApiSettings.nonce,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variations");
      }

      const variationsData = await response.json();
      setVariations(variationsData);
    } catch (error) {
      console.error("Error fetching variations:", error);
      setError("Failed to load product variations");
    } finally {
      setIsLoadingVariations(false);
    }
  };

  const fetchCurrentCogs = async (productId, variationId) => {
    try {
      const endpoint = variationId
        ? `/wp-json/wc/v3/products/${productId}/variations/${variationId}`
        : `/wp-json/wc/v3/products/${productId}`;

      const response = await fetch(endpoint, {
        headers: {
          "X-WP-Nonce": wpApiSettings.nonce,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }

      const productData = await response.json();

      // Check for COGS data in the product response
      if (productData.cost_of_goods_sold) {
        setCurrentCogs(productData.cost_of_goods_sold.total_value || 0);
      } else {
        // Check meta_data for COGS field (fallback)
        const cogsMetaData = productData.meta_data?.find(
          (meta) => meta.key === "_wc_cog_cost"
        );
        setCurrentCogs(cogsMetaData ? parseFloat(cogsMetaData.value) : 0);
      }
    } catch (error) {
      console.error("Error fetching current COGS:", error);
      setCurrentCogs(0);
    }
  };

  const handleAssignCogs = async () => {
    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (product.type === "variable" && !selectedVariationId) {
      setError("Please select a product variation");
      return;
    }

    const cogsValue = parseFloat(newCogsValue);
    if (isNaN(cogsValue) || cogsValue < 0) {
      setError("Please enter a valid cost value");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const endpoint = selectedVariationId
        ? `/wp-json/wc/v3/products/${selectedProductId}/variations/${selectedVariationId}`
        : `/wp-json/wc/v3/products/${selectedProductId}`;

      // Prepare the update payload
      const payload = {
        cost_of_goods_sold: {
          values: [{ defined_value: cogsValue }],
        },
      };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update COGS");
      }

      const updatedProduct = await response.json();
      setSuccess(
        `Successfully assigned COGS value of $${cogsValue.toFixed(2)} to ${
          selectedVariationId ? "variation" : "product"
        }`
      );

      // Update the current COGS display
      setCurrentCogs(cogsValue);
    } catch (error) {
      console.error("Error assigning COGS:", error);
      setError(error.message || "Failed to assign COGS value");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setSelectedProductId("");
      setSelectedVariationId("");
      setVariations([]);
      setCurrentCogs(null);
      setError("");
      setSuccess("");
      setNewCogsValue(totalCost.toFixed(2));
      onClose();
    }
  };

  const productOptions = products.map((product) => ({
    label: `${product.name} (${product.type})`,
    value: product.id.toString(),
  }));

  const variationOptions = variations.map((variation) => ({
    label: variation.attributes
      .map((attr) => `${attr.name}: ${attr.option}`)
      .join(", "),
    value: variation.id.toString(),
  }));

  return (
    isOpen && (
      <Modal
        title="Assign COGS to WooCommerce Product"
        onRequestClose={handleClose}
        className="assign-cogs-modal"
        size="medium"
      >
        <div className="modal-content">
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "13px",
              color: "#646970",
            }}
          >
            Select a WooCommerce product or variation and assign the recipe cost
            as its Cost of Goods Sold (COGS) value.
          </p>

          {error && (
            <Notice status="error" isDismissible={false}>
              {error}
            </Notice>
          )}

          {success && (
            <Notice status="success" isDismissible={false}>
              {success}
            </Notice>
          )}

          <Flex gap="1rem" direction="column">
            {/* Recipe Cost Summary */}
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center">
                  <div>
                    <strong>Total Recipe Cost:</strong>{" "}
                    <span style={{ fontSize: "1.2em", color: "#2271b1" }}>
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <strong>Cost per Serving:</strong>{" "}
                    <span style={{ fontSize: "1.2em", color: "#2271b1" }}>
                      ${costPerServing.toFixed(2)}
                    </span>
                  </div>
                </Flex>
              </CardBody>
            </Card>

            {/* Product Selection */}
            {isLoadingProducts ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <Spinner />
                <p>Loading products...</p>
              </div>
            ) : (
              <SelectControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                label="Select Product"
                value={selectedProductId}
                options={[
                  { label: "Choose a product...", value: "" },
                  ...productOptions,
                ]}
                onChange={(value) => setSelectedProductId(value)}
              />
            )}

            {/* Variation Selection (for variable products) */}
            {selectedProductId &&
              products.find((p) => p.id === parseInt(selectedProductId))
                ?.type === "variable" && (
                <>
                  {isLoadingVariations ? (
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                      <Spinner />
                      <p>Loading variations...</p>
                    </div>
                  ) : (
                    <SelectControl
                      __next40pxDefaultSize
                      __nextHasNoMarginBottom
                      label="Select Variation"
                      value={selectedVariationId}
                      options={[
                        { label: "Choose a variation...", value: "" },
                        ...variationOptions,
                      ]}
                      onChange={(value) => setSelectedVariationId(value)}
                    />
                  )}
                </>
              )}

            {/* Current COGS Display */}
            {currentCogs !== null && (
              <Card>
                <CardBody>
                  <Flex justify="space-between" align="center">
                    <strong>Current COGS Value:</strong>
                    <span
                      style={{
                        fontSize: "1.1em",
                        color: currentCogs > 0 ? "#000" : "#999",
                      }}
                    >
                      ${currentCogs.toFixed(2)}
                    </span>
                  </Flex>
                </CardBody>
              </Card>
            )}

            {/* New COGS Value Input */}
            <TextControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label="New COGS Value ($)"
              type="number"
              step="0.01"
              min="0"
              value={newCogsValue}
              onChange={(value) => setNewCogsValue(value)}
              help="Default is set to the total recipe cost. Adjust if needed."
            />

            {/* Action Buttons */}
            <Flex justify="flex-end" gap="1rem">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignCogs}
                isBusy={isSaving}
                disabled={
                  !selectedProductId ||
                  (products.find((p) => p.id === parseInt(selectedProductId))
                    ?.type === "variable" &&
                    !selectedVariationId) ||
                  isSaving
                }
              >
                {isSaving ? "Assigning..." : "Assign COGS"}
              </Button>
            </Flex>
          </Flex>
        </div>
      </Modal>
    )
  );
}

export default AssignCogsModal;
