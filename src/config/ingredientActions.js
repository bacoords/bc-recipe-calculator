import { Icon, Button, Flex } from "@wordpress/components";
import { edit, trash } from "@wordpress/icons";

/**
 * Ingredient actions configuration for DataViews
 */
export const ingredientActions = (navigateToEditIngredient) => [
  {
    id: "edit",
    label: "Edit",
    icon: <Icon icon={edit} />,
    supportsBulk: true,
    callback: (items) => {
      const item = items[0];
      navigateToEditIngredient(item.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    isDestructive: true,
    supportsBulk: true,
    icon: <Icon icon={trash} />,
    RenderModal: ({ items, closeModal, onActionPerformed }) => {
      const handleConfirmDelete = async () => {
        try {
          // Delete each ingredient using the REST API
          for (const item of items) {
            const response = await fetch(
              `/wp-json/wp/v2/bc_ingredient/${item.id}`,
              {
                method: "DELETE",
                headers: {
                  "X-WP-Nonce": wpApiSettings.nonce,
                },
              }
            );
            if (!response.ok) {
              throw new Error(`Failed to delete ingredient ${item.id}`);
            }
          }
          console.log(`Successfully deleted ${items.length} ingredient(s)`);

          // Call onActionPerformed if it exists
          if (typeof onActionPerformed === "function") {
            onActionPerformed();
          }
          closeModal();
        } catch (error) {
          console.error("Error deleting ingredients:", error);
          // You could add error handling here, like showing a notification
        }
      };

      return (
        <div>
          <p>Are you sure you want to delete {items.length} ingredient(s)?</p>
          <Flex justify="flex-end" style={{ marginTop: "20px" }}>
            <Button
              variant="primary"
              isDestructive
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </Flex>
        </div>
      );
    },
  },
];
