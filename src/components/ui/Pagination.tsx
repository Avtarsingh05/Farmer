import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className={cn('flex items-center justify-between border-t border-neutral-200 px-4 sm:px-0 mt-6', className)}
      aria-label="Pagination"
    >
      <div className="-mt-px flex w-0 flex-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="mr-3 h-5 w-5 text-neutral-400" aria-hidden="true" />
          Previous
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">
        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-neutral-500">
                ...
              </span>
            )}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium',
              currentPage === page
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-neutral-500">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          Next
          <ChevronRight className="ml-3 h-5 w-5 text-neutral-400" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
