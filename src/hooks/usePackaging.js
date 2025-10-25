import { useEntityRecords } from "@wordpress/core-data";

/**
 * Custom hook for fetching packaging data
 */
export function usePackaging() {
  const { hasResolved, records } = useEntityRecords(
    "taxonomy",
    "bc_packaging",
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
