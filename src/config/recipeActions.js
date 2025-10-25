import { Icon, Button, Flex } from "@wordpress/components";
import { edit, trash } from "@wordpress/icons";
import { useDispatch } from "@wordpress/data";
import { store as coreDataStore } from "@wordpress/core-data";

/**
 * Recipe actions configuration for DataViews
 */
export const recipeActions = (navigateToEdit) => [
  {
    id: "edit",
    label: "Edit",
    icon: <Icon icon={edit} />,
    supportsBulk: true,
    callback: (items) => {
      const item = items[0];
      navigateToEdit(item.id);
    },
  },
  {
    id: "delete",
    label: "Delete",
    supportsBulk: true,
    icon: <Icon icon={trash} />,
    RenderModal: ({ items, closeModal, onActionPerformed }) => {
      const { deleteEntityRecord } = useDispatch(coreDataStore);

      const handleConfirmDelete = async () => {
        try {
          // Delete each recipe using the WordPress data store
          for (const item of items) {
            await deleteEntityRecord("postType", "bc_recipe", item.id);
          }
          console.log(`Successfully deleted ${items.length} recipe(s)`);

          // Call onActionPerformed if it exists
          if (typeof onActionPerformed === "function") {
            onActionPerformed();
          }
          closeModal();
        } catch (error) {
          console.error("Error deleting recipes:", error);
          // You could add error handling here, like showing a notification
        }
      };

      return (
        <div>
          <p>Are you sure you want to delete {items.length} recipe(s)?</p>
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
