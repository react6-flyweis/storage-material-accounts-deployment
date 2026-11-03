import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  showItemCount?: boolean;
}

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className,
  showItemCount = true,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between mt-6 p-4 border-t border-gray-100",
        className
      )}
    >
      {showItemCount ? (
        <p className="lg:text-sm text-xs text-gray-500">
          Showing {startItem} to {endItem} of {totalItems} results
        </p>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-gray-600 border-gray-200"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((p, index) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="h-8 w-8 flex items-center justify-center text-xs text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const page = Number(p);
          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 ${
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
