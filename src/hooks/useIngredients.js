import { useEntityRecords } from "@wordpress/core-data";

/**
 * Custom hook for fetching ingredient data
 */
export function useIngredients() {
  const { hasResolved, records } = useEntityRecords(
    "taxonomy",
    "bc_ingredient",
    {
      per_page: 100,
      order: "asc",
      orderby: "name",
    }
  );

  return {
    hasResolved,
    records: records || [],
    totalItems: records?.length || 0,
  };
}
