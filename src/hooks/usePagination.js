import { useState, useMemo } from 'react';

/**
 * Simple pagination hook.
 * @param {any[]} items    - full array to paginate
 * @param {number} pageSize
 */
export function usePagination(items = [], pageSize = 20) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 when item set changes
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (n) => setPage(Math.max(1, Math.min(n, totalPages)));

  return { page, totalPages, paginated, nextPage, prevPage, goToPage, setPage };
}
