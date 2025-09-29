import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '../../../hooks/usePagination';

interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  className?: string;
}

export function Pagination({ 
  totalItems,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  size = 'md',
  variant = 'default',
  className = '' 
}: PaginationProps) {
  const pagination = usePagination({
    totalItems,
    itemsPerPage,
    initialPage: currentPage
  });

  const sizeClasses = {
    sm: {
      button: 'w-8 h-8 text-xs',
      nav: 'px-2 py-1 text-xs'
    },
    md: {
      button: 'w-10 h-10 text-sm',
      nav: 'px-3 py-2 text-sm'
    },
    lg: {
      button: 'w-12 h-12 text-base',
      nav: 'px-4 py-3 text-base'
    }
  };

  const config = sizeClasses[size];
  const pageNumbers = pagination.getPageNumbers();

  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
    onPageChange?.(page);
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center space-x-4 ${className}`}>
        <button
          onClick={() => {
            pagination.previousPage();
            onPageChange?.(pagination.currentPage - 1);
          }}
          disabled={!pagination.canGoPrevious}
          className={`${config.nav} bg-white/10 text-white rounded-lg 
                   hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors flex items-center space-x-1`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        <span className="text-sm text-gray-400">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        
        <button
          onClick={() => {
            pagination.nextPage();
            onPageChange?.(pagination.currentPage + 1);
          }}
          disabled={!pagination.canGoNext}
          className={`${config.nav} bg-white/10 text-white rounded-lg 
                   hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors flex items-center space-x-1`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={() => {
          pagination.previousPage();
          onPageChange?.(pagination.currentPage - 1);
        }}
        disabled={!pagination.canGoPrevious}
        className={`${config.nav} bg-white/10 text-white rounded-lg 
                 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors`}
      >
        Previous
      </button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`${config.button} rounded-lg transition-colors ${
                page === pagination.currentPage
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="text-gray-400 px-2">
              {page}
            </span>
          )
        ))}
      </div>
      
      <button
        onClick={() => {
          pagination.nextPage();
          onPageChange?.(pagination.currentPage + 1);
        }}
        disabled={!pagination.canGoNext}
        className={`${config.nav} bg-white/10 text-white rounded-lg 
                 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors`}
      >
        Next
      </button>
    </div>
  );
}

// Hook-based pagination for external control
export function usePaginationControls(props: PaginationProps) {
  const pagination = usePagination({
    totalItems: props.totalItems,
    itemsPerPage: props.itemsPerPage || 10,
    initialPage: props.currentPage || 1
  });

  return {
    ...pagination,
    PaginationComponent: () => (
      <Pagination {...props} currentPage={pagination.currentPage} />
    )
  };
}