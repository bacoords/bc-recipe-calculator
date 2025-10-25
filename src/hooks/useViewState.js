import { useState } from "@wordpress/element";

/**
 * Custom hook for managing DataViews state
 */
export function useViewState(type = "recipes") {
  const getDefaultView = (type) => {
    switch (type) {
      case "ingredients":
        return {
          type: "table",
          perPage: 10,
          page: 1,
          layout: {},
          sort: {
            orderby: "name",
            order: "asc",
          },
          search: "",
          filters: [],
          titleField: "name",
          fields: ["price", "quantity", "unit"],
        };
      case "packaging":
        return {
          type: "table",
          perPage: 10,
          page: 1,
          layout: {},
          sort: {
            orderby: "name",
            order: "asc",
          },
          search: "",
          filters: [],
          titleField: "name",
          fields: ["price", "quantity", "unit"],
        };
      case "recipes":
      default:
        return {
          type: "table",
          perPage: 10,
          page: 1,
          layout: {},
          sort: {
            orderby: "title",
            order: "asc",
          },
          search: "",
          filters: [],
          titleField: "title",
          fields: ["total_cost", "cost_per_serving"],
        };
    }
  };

  const [view, setView] = useState(getDefaultView(type));

  return {
    view,
    setView,
    getDefaultView,
  };
}
