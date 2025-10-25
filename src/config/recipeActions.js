import { Icon, Button, Flex } from "@wordpress/components";
import { edit, trash, copy } from "@wordpress/icons";
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
    id: "duplicate",
    label: "Duplicate",
    icon: <Icon icon={copy} />,
    supportsBulk: false,
    RenderModal: ({ items, closeModal, onActionPerformed }) => {
      const { saveEntityRecord } = useDispatch(coreDataStore);

      const handleDuplicate = async () => {
        try {
          const item = items[0];

          // Create a duplicate with "(Copy)" appended to the title
          const duplicateData = {
            title: item.title?.rendered
              ? `${item.title.rendered} (Copy)`
              : `${item.title?.raw || 'Recipe'} (Copy)`,
            status: 'publish',
            meta: {
              recipe_ingredients: item.meta?.recipe_ingredients || [],
              recipe_servings: item.meta?.recipe_servings || 1,
              recipe_notes: item.meta?.recipe_notes || '',
              total_cost: item.meta?.total_cost || 0,
              cost_per_serving: item.meta?.cost_per_serving || 0,
            },
          };

          await saveEntityRecord("postType", "bc_recipe", duplicateData);
          console.log("Successfully duplicated recipe");

          if (typeof onActionPerformed === "function") {
            onActionPerformed();
          }
          closeModal();
        } catch (error) {
          console.error("Error duplicating recipe:", error);
        }
      };

      return (
        <div>
          <p>
            This will create a published copy of "{items[0].title?.rendered || items[0].title?.raw}".
          </p>
          <Flex justify="flex-end" style={{ marginTop: "20px" }}>
            <Button variant="primary" onClick={handleDuplicate}>
              Duplicate
            </Button>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </Flex>
        </div>
      );
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
