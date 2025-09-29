import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const totalPages = useMemo(() => 
    Math.ceil(totalItems / pageSize), 
    [totalItems, pageSize]
  );

  const startIndex = useMemo(() => 
    (currentPage - 1) * pageSize, 
    [currentPage, pageSize]
  );

  const endIndex = useMemo(() => 
    Math.min(startIndex + pageSize, totalItems), 
    [startIndex, pageSize, totalItems]
  );

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [canGoNext]);

  const previousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  }, []);

  // Generate page numbers for pagination UI
  const getPageNumbers = useCallback((maxVisible: number = 5) => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      const halfVisible = Math.floor(maxVisible / 2);
      const start = Math.max(2, currentPage - halfVisible);
      const end = Math.min(totalPages - 1, currentPage + halfVisible);
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    canGoNext,
    canGoPrevious,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    changePageSize,
    getPageNumbers
  };
}