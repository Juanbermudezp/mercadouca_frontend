import { useState } from 'react';

export function usePagination(initialSize = 10) {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const reset = () => setPage(0);
  return { page, setPage, totalPages, setTotalPages, reset };
}
