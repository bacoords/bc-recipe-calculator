/**
 * Ingredient fields configuration for DataViews
 */
export const ingredientFields = (navigateToEditIngredient) => [
  {
    id: "name",
    type: "text",
    label: "Ingredient Name",
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
    label: "Price ($)",
    getValue: (item) => item.meta?.ingredient_price || 0,
    render: ({ item }) => {
      const price = item.meta?.ingredient_price || 0;
      return `$${parseFloat(price).toFixed(2)}`;
    },
  },
  {
    id: "quantity",
    type: "number",
    label: "Quantity per Package",
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
    getValue: (item) => item.meta?.ingredient_unit || "",
    render: ({ item }) => {
      return item.meta?.ingredient_unit || "";
    },
  },
];
