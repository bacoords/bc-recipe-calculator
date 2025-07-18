import { useState } from "@wordpress/element";
import {
  Button,
  TextControl,
  Modal,
  Notice,
  Flex,
} from "@wordpress/components";

function CreateIngredientModal({
  isOpen,
  onClose,
  onIngredientCreated,
  standalone = false,
}) {
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });
  const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
  const [error, setError] = useState("");

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

      // Reset form
      setNewIngredient({ name: "", price: "", quantity: "", unit: "" });

      // Close modal
      if (standalone) {
        setIsModalOpen(false);
      } else if (onClose) {
        onClose();
      }

      // Notify parent component
      if (onIngredientCreated) {
        onIngredientCreated(createdIngredient);
      }
    } catch (error) {
      console.error("Error creating ingredient:", error);
      setError("Failed to create ingredient");
    } finally {
      setIsCreatingIngredient(false);
    }
  };

  const handleClose = () => {
    if (!isCreatingIngredient) {
      setNewIngredient({ name: "", price: "", quantity: "", unit: "" });
      setError("");
      if (standalone) {
        setIsModalOpen(false);
      } else if (onClose) {
        onClose();
      }
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    if (standalone) {
      setIsModalOpen(true);
    }
  };

  // If standalone, render as a button that opens the modal
  if (standalone) {
    return (
      <>
        <Button variant="primary" onClick={handleOpen}>
          Add New Ingredient
        </Button>

        {isModalOpen && (
          <Modal
            title="Create New Ingredient"
            onRequestClose={handleClose}
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

              {error && (
                <Notice status="error" isDismissible={false}>
                  {error}
                </Notice>
              )}
              <Flex gap="1rem" direction="column">
                <TextControl
                  label="Ingredient Name *"
                  __nextHasNoMarginBottom
                  value={newIngredient.name}
                  onChange={(value) =>
                    setNewIngredient({ ...newIngredient, name: value })
                  }
                  placeholder="e.g., All-purpose flour"
                  required
                />

                <TextControl
                  label="Price per Unit ($) *"
                  __nextHasNoMarginBottom
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
                  __nextHasNoMarginBottom
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
                  __nextHasNoMarginBottom
                  value={newIngredient.unit}
                  onChange={(value) =>
                    setNewIngredient({ ...newIngredient, unit: value })
                  }
                  placeholder="e.g., grams, cups, oz"
                  required
                />
                <Flex justify="flex-end" gap="1rem">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isCreatingIngredient}
                  >
                    Cancel
                  </Button>
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
                </Flex>
              </Flex>
            </div>
          </Modal>
        )}
      </>
    );
  }

  // Modal version (existing functionality)
  return (
    isOpen && (
      <Modal
        title="Create New Ingredient"
        onRequestClose={handleClose}
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

          {error && (
            <Notice status="error" isDismissible={false}>
              {error}
            </Notice>
          )}
          <Flex gap="1rem" direction="column">
            <TextControl
              label="Ingredient Name *"
              __nextHasNoMarginBottom
              value={newIngredient.name}
              onChange={(value) =>
                setNewIngredient({ ...newIngredient, name: value })
              }
              placeholder="e.g., All-purpose flour"
              required
            />

            <TextControl
              label="Price per Unit ($) *"
              __nextHasNoMarginBottom
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
              __nextHasNoMarginBottom
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
              __nextHasNoMarginBottom
              value={newIngredient.unit}
              onChange={(value) =>
                setNewIngredient({ ...newIngredient, unit: value })
              }
              placeholder="e.g., grams, cups, oz"
              required
            />
            <Flex justify="flex-end" gap="1rem">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isCreatingIngredient}
              >
                Cancel
              </Button>
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
            </Flex>
          </Flex>
        </div>
      </Modal>
    )
  );
}

export default CreateIngredientModal;
