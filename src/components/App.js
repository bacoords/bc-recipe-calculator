import { useState, useMemo, useEffect } from "react";
import { DataViews } from "@wordpress/dataviews/wp";
import { useEntityRecords } from "@wordpress/core-data";
import { useDispatch, useSelect } from "@wordpress/data";
import { store as coreDataStore } from "@wordpress/core-data";
import { Icon, Button, Spinner } from "@wordpress/components";
import { edit, trash, arrowLeft } from "@wordpress/icons";
import SingleRecipe from "./SingleRecipe";
import CreateRecipeModal from "./CreateRecipeModal";
import Header from "./Header";

function App() {
  const [view, setView] = useState({
    type: "table",
    perPage: 10,
    page: 1,
    sort: {
      field: "title",
      direction: "asc",
    },
    search: "",
    filters: [],
    titleField: "title",
    fields: ["total_cost", "cost_per_serving"],
  });

  // Get the post ID from URL parameters
  const [editingPostId, setEditingPostId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("edit");
    setEditingPostId(postId ? parseInt(postId) : null);
  }, []);

  const navigateToEdit = (postId) => {
    const url = new URL(window.location);
    url.searchParams.set("edit", postId);
    window.history.pushState({}, "", url);
    setEditingPostId(postId);
  };

  const navigateToList = () => {
    const url = new URL(window.location);
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url);
    setEditingPostId(null);
  };

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get("edit");
      setEditingPostId(postId ? parseInt(postId) : null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const queryArgs = useMemo(() => {
    const filters = {};
    view.filters.forEach((filter) => {
      if (filter.field === "author" && filter.operator === "is") {
        filters.author = filter.value;
      }
    });
    return {
      per_page: view.perPage,
      page: view.page,
      _embed: "author",
      order: view.sort?.direction,
      orderby: view.sort?.field,
      search: view.search,
      ...filters,
    };
  }, [view]);

  const { hasResolved, records } = useEntityRecords(
    "postType",
    "bc_recipe",
    queryArgs
  );

  const handleRecipeCreated = (newRecipe) => {
    navigateToEdit(newRecipe.id);
  };

  const fields = [
    {
      id: "title",
      type: "text",
      label: "Title",
      header: "Recipe Title",
      enableHiding: false,
      getValue: (item) => item.title?.rendered || item.title?.raw || "",
      render: ({ item }) => (
        <button
          style={{
            background: "none",
            border: "none",
            color: "#0073aa",
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
            font: "inherit",
          }}
          onClick={() => navigateToEdit(item.id)}
        >
          {item.title?.rendered || item.title?.raw || ""}
        </button>
      ),
      sort: (a, b) => {
        const titleA = a.title?.rendered || a.title?.raw || "";
        const titleB = b.title?.rendered || b.title?.raw || "";
        return titleA.localeCompare(titleB);
      },
    },
    {
      id: "total_cost",
      type: "number",
      label: "Total Cost",
      header: "Total Cost ($)",
      getValue: (item) => item.meta?.total_cost || 0,
      render: ({ item }) => {
        const cost = item.meta?.total_cost || 0;
        return `$${cost.toFixed(2)}`;
      },
    },
    {
      id: "cost_per_serving",
      type: "number",
      label: "Cost per Serving",
      header: "Cost per Serving ($)",
      getValue: (item) => item.meta?.cost_per_serving || 0,
      render: ({ item }) => {
        const cost = item.meta?.cost_per_serving || 0;
        return `$${cost.toFixed(2)}`;
      },
    },
  ];

  const actions = [
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
      isDestructive: true,
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
          <div style={{ padding: "20px" }}>
            <p>Are you sure you want to delete {items.length} recipe(s)?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  // If we're editing a specific recipe, show the SingleRecipe component
  if (editingPostId) {
    return (
      <div>
        <Header>
          <Button onClick={navigateToList}>
            <Icon icon={arrowLeft} />
            Back to Recipes
          </Button>
        </Header>
        <div style={{ padding: "1rem" }}>
          <SingleRecipe postId={editingPostId} />
        </div>
      </div>
    );
  }

  if (!hasResolved) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  // Debug: Log the first record to see the data structure
  if (records && records.length > 0) {
    console.log("First recipe record:", records[0]);
    console.log("Title:", records[0].title);
    console.log("Meta:", records[0].meta);
  }

  return (
    <div>
      <Header>
        <CreateRecipeModal onRecipeCreated={handleRecipeCreated} />
      </Header>
      <div style={{ padding: "1rem" }}>
        <DataViews
          data={records || []}
          fields={fields}
          view={view}
          onChangeView={setView}
          actions={actions}
          paginationInfo={{
            totalItems: records?.length || 0,
            totalPages: Math.ceil((records?.length || 0) / view.perPage),
          }}
          search={true}
          searchLabel="Search recipes..."
        />
      </div>
    </div>
  );
}

export default App;
