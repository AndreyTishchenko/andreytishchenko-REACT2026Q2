import { FIRST_PAGE } from '../constants/storage';

interface PaginationProps {
  readonly currentPage: number;
  readonly hasNextPage: boolean;
  readonly isDisabled?: boolean;
  readonly onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  hasNextPage,
  isDisabled = false,
  onPageChange,
}: PaginationProps) {
  const canGoBack = currentPage > FIRST_PAGE && !isDisabled;
  const canGoForward = hasNextPage && !isDisabled;

  return (
    <nav className="pagination" aria-label="Results pagination">
      <button
        type="button"
        disabled={!canGoBack}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      <span aria-current="page">Page {currentPage}</span>
      <button
        type="button"
        disabled={!canGoForward}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
