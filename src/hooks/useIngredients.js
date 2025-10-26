import { useMemo } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { store as coreDataStore } from "@wordpress/core-data";

/**
 * Custom hook for fetching ingredient data
 */
export function useIngredients(view) {
  const queryArgs = useMemo(() => {
    return {
      per_page: view?.perPage || 10,
      page: view?.page || 1,
      order: view?.sort?.direction || "asc",
      orderby: view?.sort?.field || "name",
      search: view?.search || "",
    };
  }, [view]);

  const { hasResolved, records, totalItems, totalPages } = useSelect(
    (select) => {
      const { getEntityRecords, hasFinishedResolution, getEntityRecordsTotalItems, getEntityRecordsTotalPages } =
        select(coreDataStore);

      const selectorArgs = ["taxonomy", "bc_ingredient", queryArgs];

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
