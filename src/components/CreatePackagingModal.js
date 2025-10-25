import { useState } from "@wordpress/element";
import {
  Button,
  TextControl,
  Modal,
  Notice,
  Flex,
} from "@wordpress/components";

function CreatePackagingModal({
  isOpen,
  onClose,
  onPackagingCreated,
  standalone = false,
}) {
  const [newPackaging, setNewPackaging] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });
  const [isCreatingPackaging, setIsCreatingPackaging] = useState(false);
  const [error, setError] = useState("");

  const createNewPackaging = async () => {
    if (!newPackaging.name.trim()) {
      setError("Packaging name is required");
      return;
    }

    if (!newPackaging.price.trim()) {
      setError("Price is required");
      return;
    }

    if (
      isNaN(parseFloat(newPackaging.price)) ||
      parseFloat(newPackaging.price) <= 0
    ) {
      setError("Price must be a valid positive number");
      return;
    }

    if (!newPackaging.quantity.trim()) {
      setError("Quantity is required");
      return;
    }

    if (
      isNaN(parseFloat(newPackaging.quantity)) ||
      parseFloat(newPackaging.quantity) <= 0
    ) {
      setError("Quantity must be a valid positive number");
      return;
    }

    if (!newPackaging.unit.trim()) {
      setError("Unit is required");
      return;
    }

    try {
      setIsCreatingPackaging(true);
      setError("");

      const response = await fetch("/wp-json/wp/v2/bc_packaging", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify({
          name: newPackaging.name,
          meta: {
            packaging_price: newPackaging.price,
            packaging_quantity: newPackaging.quantity,
            packaging_unit: newPackaging.unit,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create packaging");
      }

      const createdPackaging = await response.json();

      // Reset form
      setNewPackaging({ name: "", price: "", quantity: "", unit: "" });

      // Close modal
      if (standalone) {
        setIsModalOpen(false);
      } else if (onClose) {
        onClose();
      }

      // Notify parent component
      if (onPackagingCreated) {
        onPackagingCreated(createdPackaging);
      }
    } catch (error) {
      console.error("Error creating packaging:", error);
      setError("Failed to create packaging");
    } finally {
      setIsCreatingPackaging(false);
    }
  };

  const handleClose = () => {
    if (!isCreatingPackaging) {
      setNewPackaging({ name: "", price: "", quantity: "", unit: "" });
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
          Add New Packaging
        </Button>

        {isModalOpen && (
          <Modal
            title="Create New Packaging"
            onRequestClose={handleClose}
            className="packaging-modal"
          >
            <div className="modal-content">
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "13px",
                  color: "#646970",
                }}
              >
                Create a new packaging with pricing information. This will be
                available for all recipes.
              </p>

              {error && (
                <Notice status="error" isDismissible={false}>
                  {error}
                </Notice>
              )}
              <Flex gap="1rem" direction="column">
                <TextControl
                  label="Packaging Name *"
                  __nextHasNoMarginBottom
                  value={newPackaging.name}
                  onChange={(value) =>
                    setNewPackaging({ ...newPackaging, name: value })
                  }
                  __next40pxDefaultSize
                  placeholder="e.g., All-purpose flour"
                  required
                />

                <TextControl
                  label="Price per Unit ($) *"
                  __nextHasNoMarginBottom
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newPackaging.price}
                  onChange={(value) =>
                    setNewPackaging({ ...newPackaging, price: value })
                  }
                  __next40pxDefaultSize
                  placeholder="0.00"
                  required
                />

                <TextControl
                  label="Default Quantity *"
                  __nextHasNoMarginBottom
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newPackaging.quantity}
                  onChange={(value) =>
                    setNewPackaging({ ...newPackaging, quantity: value })
                  }
                  __next40pxDefaultSize
                  placeholder="0"
                  required
                />

                <TextControl
                  label="Unit *"
                  __nextHasNoMarginBottom
                  value={newPackaging.unit}
                  onChange={(value) =>
                    setNewPackaging({ ...newPackaging, unit: value })
                  }
                  __next40pxDefaultSize
                  placeholder="e.g., grams, cups, oz"
                  required
                />
                <Flex justify="flex-end" gap="1rem">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isCreatingPackaging}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={createNewPackaging}
                    isBusy={isCreatingPackaging}
                    disabled={
                      !newPackaging.name.trim() ||
                      !newPackaging.price.trim() ||
                      !newPackaging.quantity.trim() ||
                      !newPackaging.unit.trim() ||
                      isNaN(parseFloat(newPackaging.price)) ||
                      parseFloat(newPackaging.price) <= 0 ||
                      isNaN(parseFloat(newPackaging.quantity)) ||
                      parseFloat(newPackaging.quantity) <= 0
                    }
                  >
                    {isCreatingPackaging ? "Creating..." : "Create Packaging"}
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
        title="Create New Packaging"
        onRequestClose={handleClose}
        className="packaging-modal"
      >
        <div className="modal-content">
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "13px",
              color: "#646970",
            }}
          >
            Create a new packaging with pricing information. This will be
            available for all recipes.
          </p>

          {error && (
            <Notice status="error" isDismissible={false}>
              {error}
            </Notice>
          )}
          <Flex gap="1rem" direction="column">
            <TextControl
              label="Packaging Name *"
              __nextHasNoMarginBottom
              value={newPackaging.name}
              onChange={(value) =>
                setNewPackaging({ ...newPackaging, name: value })
              }
              __next40pxDefaultSize
              placeholder="e.g., All-purpose flour"
              required
            />

            <TextControl
              label="Price per Unit ($) *"
              __nextHasNoMarginBottom
              type="number"
              step="0.01"
              min="0.01"
              value={newPackaging.price}
              onChange={(value) =>
                setNewPackaging({ ...newPackaging, price: value })
              }
              __next40pxDefaultSize
              placeholder="0.00"
              required
            />

            <TextControl
              label="Default Quantity *"
              __nextHasNoMarginBottom
              type="number"
              step="0.01"
              min="0.01"
              value={newPackaging.quantity}
              onChange={(value) =>
                setNewPackaging({ ...newPackaging, quantity: value })
              }
              __next40pxDefaultSize
              placeholder="0"
              required
            />

            <TextControl
              label="Unit *"
              __nextHasNoMarginBottom
              value={newPackaging.unit}
              onChange={(value) =>
                setNewPackaging({ ...newPackaging, unit: value })
              }
              __next40pxDefaultSize
              placeholder="e.g., grams, cups, oz"
              required
            />
            <Flex justify="flex-end" gap="1rem">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isCreatingPackaging}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={createNewPackaging}
                isBusy={isCreatingPackaging}
                disabled={
                  !newPackaging.name.trim() ||
                  !newPackaging.price.trim() ||
                  !newPackaging.quantity.trim() ||
                  !newPackaging.unit.trim() ||
                  isNaN(parseFloat(newPackaging.price)) ||
                  parseFloat(newPackaging.price) <= 0 ||
                  isNaN(parseFloat(newPackaging.quantity)) ||
                  parseFloat(newPackaging.quantity) <= 0
                }
              >
                {isCreatingPackaging ? "Creating..." : "Create Packaging"}
              </Button>
            </Flex>
          </Flex>
        </div>
      </Modal>
    )
  );
}

export default CreatePackagingModal;
