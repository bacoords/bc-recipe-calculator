import { DataViews } from "@wordpress/dataviews/wp";
import { Button, Flex, Spinner } from "@wordpress/components";
import { usePackaging } from "../../hooks/usePackaging";
import { useViewState } from "../../hooks/useViewState";
import { packagingFields } from "../../config/packagingFields";
import { packagingActions } from "../../config/packagingActions";
import SinglePackaging from "../SinglePackaging";
import CreatePackagingModal from "../CreatePackagingModal";

/**
 * Packaging view component that handles both list and edit states
 */
export default function PackagingView({
  editingTermId,
  navigateToEditPackaging,
  navigateToPackagingList,
}) {
  const { view, setView } = useViewState("packaging");
  const { hasResolved, records, totalItems } = usePackaging();

  // If we're editing a specific packaging, show the SinglePackaging component
  if (editingTermId) {
    return (
      <div>
        <div style={{ marginBottom: "1rem", padding: "1rem" }}>
          <Button onClick={navigateToPackagingList}>
            ← Back to Packaging
          </Button>
        </div>
        <SinglePackaging termId={editingTermId} />
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
          <h1>Packaging</h1>
          <CreatePackagingModal
            standalone={true}
            isOpen={false}
            onPackagingCreated={() => {
              // Refresh the packaging list
              window.location.reload();
            }}
          />
        </Flex>
      </div>
      <DataViews
        data={records}
        fields={packagingFields(navigateToEditPackaging)}
        view={view}
        onChangeView={setView}
        actions={packagingActions(navigateToEditPackaging)}
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
