import { useMemo } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { store as coreDataStore } from "@wordpress/core-data";

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

  const { hasResolved, records, totalItems, totalPages } = useSelect(
    (select) => {
      const { getEntityRecords, hasFinishedResolution, getEntityRecordsTotalItems, getEntityRecordsTotalPages } =
        select(coreDataStore);

      const selectorArgs = ["postType", "bc_recipe", queryArgs];

      return {
        records: getEntityRecords(...selectorArgs),
        hasResolved: hasFinishedResolution("getEntityRecords", selectorArgs),
        totalItems: getEntityRecordsTotalItems(...selectorArgs) || 0,
        totalPages: getEntityRecordsTotalPages(...selectorArgs) || 1,
      };
    },
    [queryArgs]
  );

  return {
    hasResolved,
    records: records || [],
    totalItems,
    totalPages,
  };
}
