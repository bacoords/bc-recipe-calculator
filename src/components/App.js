import { useState, useMemo, useEffect } from "react";
import { DataViews } from "@wordpress/dataviews/wp";
import { useEntityRecords } from "@wordpress/core-data";
import { Icon } from "@wordpress/components";
import { edit, external, trash, arrowLeft, plus } from "@wordpress/icons";
import SingleRecipe from "./SingleRecipe";

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
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState("");

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

  const createNewRecipe = async (title) => {
    try {
      const response = await fetch("/wp-json/wp/v2/bc_recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings?.nonce || "",
        },
        body: JSON.stringify({
          title: title,
          status: "publish",
          meta: {
            total_cost: 0,
            cost_per_serving: 0,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create recipe");
      }

      const newRecipe = await response.json();
      return newRecipe;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  };

  const handleCreateRecipe = async (title) => {
    try {
      const newRecipe = await createNewRecipe(title);
      navigateToEdit(newRecipe.id);
      setIsCreatingRecipe(false);
      setNewRecipeTitle("");
    } catch (error) {
      alert("Failed to create recipe. Please try again.");
    }
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
      RenderModal: ({ items, closeModal, onActionPerformed }) => (
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
              onClick={() => {
                console.log("Deleting items:", items);
                onActionPerformed();
                closeModal();
              }}
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
      ),
    },
  ];

  // If we're editing a specific recipe, show the SingleRecipe component
  if (editingPostId) {
    return (
      <div style={{ padding: "20px" }}>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={navigateToList}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "8px 12px",
              backgroundColor: "#f0f0f1",
              border: "1px solid #c3c4c7",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <Icon icon={arrowLeft} />
            Back to Recipes
          </button>
        </div>
        <SingleRecipe postId={editingPostId} />
      </div>
    );
  }

  if (!hasResolved) {
    return <div>Loading recipes...</div>;
  }

  // Debug: Log the first record to see the data structure
  if (records && records.length > 0) {
    console.log("First recipe record:", records[0]);
    console.log("Title:", records[0].title);
    console.log("Meta:", records[0].meta);
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>Recipe Management</h1>
        <button
          onClick={() => setIsCreatingRecipe(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            backgroundColor: "#0073aa",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <Icon icon={plus} />
          Add New Recipe
        </button>
      </div>
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

      {/* Create Recipe Modal */}
      {isCreatingRecipe && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              minWidth: "400px",
              maxWidth: "500px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
              Create New Recipe
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newRecipeTitle.trim()) {
                  handleCreateRecipe(newRecipeTitle.trim());
                }
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="recipe-title"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Recipe Title:
                </label>
                <input
                  id="recipe-title"
                  type="text"
                  value={newRecipeTitle}
                  onChange={(e) => setNewRecipeTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter recipe title..."
                  autoFocus
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingRecipe(false);
                    setNewRecipeTitle("");
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRecipeTitle.trim()}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: newRecipeTitle.trim() ? "#0073aa" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: newRecipeTitle.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Create Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
