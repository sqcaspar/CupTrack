import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showInfo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  disabled = false,
  showInfo = true
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 4) pages.push('...');
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        if (totalPages > 4) pages.push('...');
        for (let i = Math.max(totalPages - 3, 2); i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-container">
      {showInfo && (
        <div className="pagination-info">
          <span>
            Showing page {currentPage} of {totalPages} ({totalRecords} total)
          </span>
        </div>
      )}
      
      <div className="pagination">
        <button
          className="pagination-button prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        <div className="pagination-pages">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-ellipsis">…</span>
              ) : (
                <button
                  className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(page as number)}
                  disabled={disabled || page === currentPage}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          className="pagination-button next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};