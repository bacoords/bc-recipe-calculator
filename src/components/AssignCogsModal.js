import { useState, useEffect } from "@wordpress/element";
import {
  Button,
  TextControl,
  Modal,
  Notice,
  Flex,
  Spinner,
  Card,
  CardBody,
  ComboboxControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

function AssignCogsModal({ isOpen, onClose, totalCost, costPerServing }) {
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variationSearchResults, setVariationSearchResults] = useState([]);
  const [isSearchingVariations, setIsSearchingVariations] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [currentCogs, setCurrentCogs] = useState(null);
  const [newCogsValue, setNewCogsValue] = useState(totalCost.toFixed(2));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reset new COGS value when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewCogsValue(totalCost.toFixed(2));
    }
  }, [isOpen, totalCost]);

  // Fetch variations when a variable product is selected
  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.type === "variable") {
        searchVariations("");
        setSelectedVariation(null);
        setCurrentCogs(null);
      } else {
        // Simple product selected
        setVariationSearchResults([]);
        setSelectedVariation(null);
        fetchCurrentCogs(selectedProduct.id, null);
      }
    } else {
      setVariationSearchResults([]);
      setSelectedVariation(null);
      setCurrentCogs(null);
    }
  }, [selectedProduct]);

  // Fetch current COGS when variation is selected
  useEffect(() => {
    if (selectedVariation && selectedProduct) {
      fetchCurrentCogs(selectedProduct.id, selectedVariation.id);
    }
  }, [selectedVariation, selectedProduct]);

  const searchProducts = async (searchTerm) => {
    // Don't search until at least 3 characters are typed
    if (!searchTerm || searchTerm.trim().length < 3) {
      setProductSearchResults([]);
      return;
    }

    try {
      setIsSearchingProducts(true);
      setError("");

      // Build the search query
      const params = new URLSearchParams({
        per_page: "50",
        orderby: "title",
        order: "asc",
        search: searchTerm,
      });

      const response = await fetch(`/wp-json/wc/v3/products?${params}`, {
        headers: {
          "X-WP-Nonce": wpApiSettings.nonce,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const productsData = await response.json();
      setProductSearchResults(productsData);
    } catch (error) {
      console.error("Error searching products:", error);
      setError(
        "Failed to load WooCommerce products. Make sure WooCommerce is installed and activated."
      );
    } finally {
      setIsSearchingProducts(false);
    }
  };

  const searchVariations = async (searchTerm) => {
    if (!selectedProduct) return;

    try {
      setIsSearchingVariations(true);
      const response = await fetch(
        `/wp-json/wc/v3/products/${selectedProduct.id}/variations?per_page=100`,
        {
          headers: {
            "X-WP-Nonce": wpApiSettings.nonce,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variations");
      }

      let variationsData = await response.json();

      // Filter variations by search term if provided (minimum 3 characters)
      if (searchTerm && searchTerm.trim() && searchTerm.trim().length >= 3) {
        const term = searchTerm.toLowerCase();
        variationsData = variationsData.filter((variation) => {
          const variationLabel = variation.attributes
            .map((attr) => `${attr.name}: ${attr.option}`)
            .join(", ")
            .toLowerCase();
          return variationLabel.includes(term);
        });
      }

      setVariationSearchResults(variationsData);
    } catch (error) {
      console.error("Error searching variations:", error);
      setError("Failed to load product variations");
    } finally {
      setIsSearchingVariations(false);
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
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    if (selectedProduct.type === "variable" && !selectedVariation) {
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

      const endpoint = selectedVariation
        ? `/wp-json/wc/v3/products/${selectedProduct.id}/variations/${selectedVariation.id}`
        : `/wp-json/wc/v3/products/${selectedProduct.id}`;

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
          selectedVariation ? "variation" : "product"
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
      setSelectedProduct(null);
      setSelectedVariation(null);
      setProductSearchResults([]);
      setVariationSearchResults([]);
      setCurrentCogs(null);
      setError("");
      setSuccess("");
      setNewCogsValue(totalCost.toFixed(2));
      onClose();
    }
  };

  const productOptions = productSearchResults.map((product) => ({
    label: `${product.name} (${product.type})`,
    value: product.id.toString(),
  }));

  const variationOptions = variationSearchResults.map((variation) => ({
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

            {/* Product Search */}
            <ComboboxControl
              label="Search for Product"
              value={selectedProduct?.id.toString() || ""}
              onChange={(value) => {
                const product = productSearchResults.find(
                  (p) => p.id.toString() === value
                );
                setSelectedProduct(product || null);
              }}
              options={productOptions}
              onFilterValueChange={(searchTerm) => {
                searchProducts(searchTerm);
              }}
              placeholder="Type to search products..."
              help="Type at least 3 characters to search for a product"
            />

            {isSearchingProducts && (
              <div style={{ textAlign: "center", padding: "0.5rem" }}>
                <Spinner />
              </div>
            )}

            {/* Variation Search (for variable products) */}
            {selectedProduct && selectedProduct.type === "variable" && (
              <>
                <ComboboxControl
                  label="Search for Variation"
                  value={selectedVariation?.id.toString() || ""}
                  onChange={(value) => {
                    const variation = variationSearchResults.find(
                      (v) => v.id.toString() === value
                    );
                    setSelectedVariation(variation || null);
                  }}
                  options={variationOptions}
                  onFilterValueChange={(searchTerm) => {
                    searchVariations(searchTerm);
                  }}
                  placeholder="Type to search variations..."
                  help="Type at least 3 characters to filter variations"
                />

                {isSearchingVariations && (
                  <div style={{ textAlign: "center", padding: "0.5rem" }}>
                    <Spinner />
                  </div>
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
                  !selectedProduct ||
                  (selectedProduct.type === "variable" && !selectedVariation) ||
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
