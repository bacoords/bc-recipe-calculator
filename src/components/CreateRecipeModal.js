import { useState } from "react";
import { useDispatch } from "@wordpress/data";
import {
  Button,
  TextControl,
  Modal,
  Notice,
  Flex,
} from "@wordpress/components";

function CreateRecipeModal({ onRecipeCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { saveEntityRecord } = useDispatch("core");

  const createNewRecipe = async (title) => {
    try {
      const savedRecord = await saveEntityRecord("postType", "bc_recipe", {
        title: title,
        status: "publish",
        meta: {
          total_cost: 0,
          cost_per_serving: 0,
        },
      });
      return savedRecord;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRecipeTitle.trim()) return;

    try {
      setIsCreating(true);
      const newRecipe = await createNewRecipe(newRecipeTitle.trim());
      setNewRecipeTitle("");
      setIsOpen(false);
      onRecipeCreated(newRecipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setNewRecipeTitle("");
      setIsOpen(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <Button variant="primary" onClick={handleOpen}>
        Add New Recipe
      </Button>

      {isOpen && (
        <Modal
          title="Create New Recipe"
          onRequestClose={handleClose}
          className="create-recipe-modal"
        >
          <form onSubmit={handleSubmit}>
            <TextControl
              label="Recipe Title"
              __nextHasNoMarginBottom
              __next40pxDefaultSize
              value={newRecipeTitle}
              onChange={(value) => setNewRecipeTitle(value)}
              placeholder="Enter recipe title..."
              disabled={isCreating}
            />
          </form>
          <Flex justify="flex-end" style={{ marginTop: "20px" }}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Recipe"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </Flex>
        </Modal>
      )}
    </>
  );
}

export default CreateRecipeModal;
