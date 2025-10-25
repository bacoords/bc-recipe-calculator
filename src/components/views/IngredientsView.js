import { DataViews } from "@wordpress/dataviews/wp";
import { Button, Flex, Spinner } from "@wordpress/components";
import { useIngredients } from "../../hooks/useIngredients";
import { useViewState } from "../../hooks/useViewState";
import { ingredientFields } from "../../config/ingredientFields";
import { ingredientActions } from "../../config/ingredientActions";
import SingleIngredient from "../SingleIngredient";
import CreateIngredientModal from "../CreateIngredientModal";

/**
 * Ingredients view component that handles both list and edit states
 */
export default function IngredientsView({
  editingTermId,
  navigateToEditIngredient,
  navigateToIngredientsList,
}) {
  const { view, setView } = useViewState("ingredients");
  const { hasResolved, records, totalItems } = useIngredients();

  // If we're editing a specific ingredient, show the SingleIngredient component
  if (editingTermId) {
    return (
      <div>
        <div style={{ marginBottom: "1rem", padding: "1rem" }}>
          <Button onClick={navigateToIngredientsList}>
            ← Back to Ingredients
          </Button>
        </div>
        <SingleIngredient termId={editingTermId} />
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
          <h1>Ingredients</h1>
          <CreateIngredientModal
            standalone={true}
            isOpen={false}
            onIngredientCreated={() => {
              // Refresh the ingredients list
              window.location.reload();
            }}
          />
        </Flex>
      </div>
      <DataViews
        data={records}
        fields={ingredientFields(navigateToEditIngredient)}
        view={view}
        onChangeView={setView}
        actions={ingredientActions(navigateToEditIngredient)}
        paginationInfo={{
          totalItems,
          totalPages: Math.ceil(totalItems / (view?.perPage || 10)),
        }}
        defaultLayouts={{
          table: {},
        }}
      />
    </>
  );
}
