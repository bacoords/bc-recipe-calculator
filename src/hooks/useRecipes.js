import { useMemo } from "@wordpress/element";
import { useEntityRecords } from "@wordpress/core-data";

/**
 * Custom hook for fetching recipe data
 */
export function useRecipes(view) {
  const queryArgs = useMemo(() => {
    const filters = {};
    if (view?.filters) {
      view.filters.forEach((filter) => {
        if (filter.field === "author" && filter.operator === "is") {
          filters.author = filter.value;
        }
      });
    }

    return {
      per_page: view?.perPage || 10,
      page: view?.page || 1,
      _embed: "author",
      order: view?.sort?.direction || "asc",
      orderby: view?.sort?.field || "title",
      search: view?.search || "",
      ...filters,
    };
  }, [view]);

  const { hasResolved, records } = useEntityRecords(
    "postType",
    "bc_recipe",
    queryArgs
  );

  return {
    hasResolved,
    records: records || [],
    totalItems: records?.length || 0,
    totalPages: Math.ceil((records?.length || 0) / (view?.perPage || 10)),
  };
}
