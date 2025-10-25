/**
 * Recipe fields configuration for DataViews
 */
export const recipeFields = (navigateToEdit) => [
  {
    id: "title",
    type: "text",
    label: "Recipe Title",
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
    label: "Total Cost ($)",
    getValue: (item) => item.meta?.total_cost || 0,
    render: ({ item }) => {
      const cost = item.meta?.total_cost || 0;
      return `$${cost.toFixed(2)}`;
    },
  },
  {
    id: "cost_per_serving",
    type: "number",
    label: "Cost per Serving ($)",
    getValue: (item) => item.meta?.cost_per_serving || 0,
    render: ({ item }) => {
      const cost = item.meta?.cost_per_serving || 0;
      return `$${cost.toFixed(2)}`;
    },
  },
  {
    id: "recipe_servings",
    type: "number",
    label: "Servings",
    getValue: (item) => item.meta?.recipe_servings || 0,
    render: ({ item }) => {
      const servings = item.meta?.recipe_servings || 0;
      return servings;
    },
  },
];
