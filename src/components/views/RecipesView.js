import { DataViews } from "@wordpress/dataviews/wp";
import { Button, Flex, Spinner } from "@wordpress/components";
import { useRecipes } from "../../hooks/useRecipes";
import { useViewState } from "../../hooks/useViewState";
import { recipeFields } from "../../config/recipeFields";
import { recipeActions } from "../../config/recipeActions";
import SingleRecipe from "../SingleRecipe";
import CreateRecipeModal from "../CreateRecipeModal";

/**
 * Recipes view component that handles both list and edit states
 */
export default function RecipesView({
  editingPostId,
  navigateToEdit,
  navigateToList,
  onRecipeCreated,
}) {
  const { view, setView } = useViewState("recipes");
  const { hasResolved, records, totalItems, totalPages } = useRecipes(view);

  // If we're editing a specific recipe, show the SingleRecipe component
  if (editingPostId) {
    return (
      <div>
        <div style={{ marginBottom: "1rem", padding: "1rem" }}>
          <Button onClick={navigateToList}>← Back to Recipes</Button>
        </div>
        <SingleRecipe postId={editingPostId} />
      </div>
    );
  }

  // Show loading state
  if (!hasResolved) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  // List view
  return (
    <>
      <div style={{ marginBottom: "1rem", padding: "1rem" }}>
        <Flex gap={2} justify="space-between">
          <h1>Recipes</h1>
          <CreateRecipeModal onRecipeCreated={onRecipeCreated} />
        </Flex>
      </div>
      <DataViews
        data={records}
        fields={recipeFields(navigateToEdit)}
        view={view}
        onChangeView={setView}
        actions={recipeActions(navigateToEdit)}
        paginationInfo={{
          totalItems,
          totalPages,
        }}
        defaultLayouts={{
          table: {},
        }}
      />
    </>
  );
}
