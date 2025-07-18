import { useState, useMemo, useEffect } from "@wordpress/element";
import { DataViews } from "@wordpress/dataviews/wp";
import { useEntityRecords } from "@wordpress/core-data";
import { useDispatch, useSelect } from "@wordpress/data";
import { store as coreDataStore } from "@wordpress/core-data";
import { Icon, Button, Spinner, Flex, TabPanel } from "@wordpress/components";
import { edit, trash, list } from "@wordpress/icons";
import SingleRecipe from "./SingleRecipe";
import CreateRecipeModal from "./CreateRecipeModal";
import ShoppingList from "./ShoppingList";
import SingleIngredient from "./SingleIngredient";
import CreateIngredientModal from "./CreateIngredientModal";
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

  const [ingredientView, setIngredientView] = useState({
    type: "table",
    perPage: 10,
    page: 1,
    sort: {
      field: "name",
      direction: "asc",
    },
    search: "",
    filters: [],
    titleField: "name",
    fields: ["name", "price", "quantity", "unit"],
  });

  // State for managing the current view
  const [currentView, setCurrentView] = useState("recipes"); // "recipes", "shopping", or "ingredients"
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingTermId, setEditingTermId] = useState(null);

  // Initialize from URL parameters on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("edit");
    const termId = urlParams.get("edit_ingredient");
    const view = urlParams.get("view");
    const type = urlParams.get("type");

    if (postId) {
      setEditingPostId(parseInt(postId));
      setCurrentView("recipes");
      setEditingTermId(null);
    } else if (termId) {
      setEditingTermId(parseInt(termId));
      setCurrentView("ingredients");
      setEditingPostId(null);
    } else if (view === "shopping") {
      setCurrentView("shopping");
      setEditingPostId(null);
      setEditingTermId(null);
    } else if (type === "ingredients") {
      setCurrentView("ingredients");
      setEditingPostId(null);
      setEditingTermId(null);
    } else {
      setCurrentView("recipes");
      setEditingPostId(null);
      setEditingTermId(null);
    }
  }, []);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get("edit");
      const termId = urlParams.get("edit_ingredient");
      const view = urlParams.get("view");
      const type = urlParams.get("type");

      if (postId) {
        setEditingPostId(parseInt(postId));
        setCurrentView("recipes");
        setEditingTermId(null);
      } else if (termId) {
        setEditingTermId(parseInt(termId));
        setCurrentView("ingredients");
        setEditingPostId(null);
      } else if (view === "shopping") {
        setCurrentView("shopping");
        setEditingPostId(null);
        setEditingTermId(null);
      } else if (type === "ingredients") {
        setCurrentView("ingredients");
        setEditingPostId(null);
        setEditingTermId(null);
      } else {
        setCurrentView("recipes");
        setEditingPostId(null);
        setEditingTermId(null);
      }
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

  // Fetch ingredients for ingredients view
  const { hasResolved: ingredientsResolved, records: ingredients } =
    useEntityRecords("taxonomy", "bc_ingredient", {
      per_page: 100,
      order: "asc",
      orderby: "name",
    });

  const handleRecipeCreated = (newRecipe) => {
    navigateToEdit(newRecipe.id);
  };

  const navigateToEdit = (postId) => {
    const url = new URL(window.location);
    url.searchParams.set("edit", postId);
    url.searchParams.delete("view");
    window.history.pushState({}, "", url);
    setEditingPostId(postId);
    setCurrentView("recipes");
  };

  const navigateToList = () => {
    const url = new URL(window.location);
    url.searchParams.delete("edit");
    url.searchParams.delete("view");
    window.history.pushState({}, "", url);
    setEditingPostId(null);
    setCurrentView("recipes");
  };

  const navigateToShoppingList = () => {
    const url = new URL(window.location);
    url.searchParams.set("view", "shopping");
    url.searchParams.delete("edit");
    url.searchParams.delete("edit_ingredient");
    window.history.pushState({}, "", url);
    setCurrentView("shopping");
    setEditingPostId(null);
    setEditingTermId(null);
  };

  const navigateToIngredientsList = () => {
    const url = new URL(window.location);
    url.searchParams.set("type", "ingredients");
    url.searchParams.delete("edit");
    url.searchParams.delete("edit_ingredient");
    url.searchParams.delete("view");
    window.history.pushState({}, "", url);
    setCurrentView("ingredients");
    setEditingPostId(null);
    setEditingTermId(null);
  };

  const navigateToEditIngredient = (termId) => {
    const url = new URL(window.location);
    url.searchParams.set("edit_ingredient", termId);
    url.searchParams.delete("edit");
    url.searchParams.delete("view");
    url.searchParams.delete("type");
    window.history.pushState({}, "", url);
    setEditingTermId(termId);
    setCurrentView("ingredients");
    setEditingPostId(null);
  };

  const handleTabSelect = (tabName) => {
    setCurrentView(tabName);
    if (tabName === "shopping") {
      navigateToShoppingList();
    } else if (tabName === "ingredients") {
      navigateToIngredientsList();
    } else {
      // Only navigate to list if we're not currently editing a recipe
      if (!editingPostId) {
        navigateToList();
      }
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

  const ingredientFields = [
    {
      id: "name",
      type: "text",
      label: "Name",
      header: "Ingredient Name",
      enableHiding: false,

      getValue: (item) => item.name || "",
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
          onClick={() => navigateToEditIngredient(item.id)}
        >
          {item.name || ""}
        </button>
      ),
      sort: (a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      id: "price",
      type: "number",
      label: "Price",
      header: "Price ($)",
      getValue: (item) => item.meta?.ingredient_price || 0,
      render: ({ item }) => {
        console.log(item);
        const price = item.meta?.ingredient_price || 0;
        return `$${parseFloat(price).toFixed(2)}`;
      },
    },
    {
      id: "quantity",
      type: "number",
      label: "Quantity",
      header: "Quantity per Package",
      getValue: (item) => item.meta?.ingredient_quantity || 0,
      render: ({ item }) => {
        const quantity = item.meta?.ingredient_quantity || 0;
        return quantity;
      },
    },
    {
      id: "unit",
      type: "text",
      label: "Unit",
      header: "Unit",
      getValue: (item) => item.meta?.ingredient_unit || "",
      render: ({ item }) => {
        return item.meta?.ingredient_unit || "";
      },
    },
  ];

  const ingredientActions = [
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

  if (!hasResolved || (currentView === "ingredients" && !ingredientsResolved)) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <TabPanel
        tabs={[
          {
            name: "recipes",
            title: "Recipes",
            content:
              // If we're editing a specific recipe, show the SingleRecipe component
              editingPostId ? (
                <div>
                  <div style={{ marginBottom: "1rem", padding: "1rem" }}>
                    <Button onClick={navigateToList}>← Back to Recipes</Button>
                  </div>
                  <SingleRecipe postId={editingPostId} />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem", padding: "1rem" }}>
                    <Flex gap={2} justify="space-between">
                      <h1>Recipes</h1>
                      <CreateRecipeModal
                        onRecipeCreated={handleRecipeCreated}
                      />
                    </Flex>
                  </div>
                  <DataViews
                    type="table"
                    data={records || []}
                    fields={fields}
                    view={view}
                    onChangeView={setView}
                    actions={actions}
                    paginationInfo={{
                      totalItems: records?.length || 0,
                      totalPages: Math.ceil(
                        (records?.length || 0) / view.perPage
                      ),
                    }}
                    search={true}
                    searchLabel="Search recipes..."
                  />
                </>
              ),
          },
          {
            name: "ingredients",
            title: "Ingredients",
            content:
              // If we're editing a specific ingredient, show the SingleIngredient component
              editingTermId ? (
                <div>
                  <div style={{ marginBottom: "1rem", padding: "1rem" }}>
                    <Button onClick={navigateToIngredientsList}>
                      ← Back to Ingredients
                    </Button>
                  </div>
                  <SingleIngredient termId={editingTermId} />
                </div>
              ) : (
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
                    type="table"
                    data={ingredients || []}
                    fields={ingredientFields}
                    view={ingredientView}
                    onChangeView={setIngredientView}
                    actions={ingredientActions}
                    paginationInfo={{
                      totalItems: ingredients?.length || 0,
                      totalPages: Math.ceil(
                        (ingredients?.length || 0) / ingredientView.perPage
                      ),
                    }}
                    search={true}
                    searchLabel="Search ingredients..."
                  />
                </>
              ),
          },
          {
            name: "shopping",
            title: "Shopping List",
            content: <ShoppingList />,
          },
        ]}
        selectedTabId={currentView}
        onSelect={handleTabSelect}
      >
        {({ content }) => <div>{content}</div>}
      </TabPanel>
    </div>
  );
}

export default App;
