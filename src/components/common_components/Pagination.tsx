// import { Button } from "../ui/button";

// const Pagination = () => {
//   return (
//     <div className="flex flex-wrap items-center justify-between mt-6 p-4 border-t border-gray-100">
//       <p className="lg:text-sm text-xs text-gray-500">
//         Showing 1 to 10 of 12 results
//       </p>
//       <div className="flex items-center gap-2">
//         <Button
//           variant="outline"
//           size="sm"
//           className="h-8 text-gray-600 border-gray-200"
//           disabled
//         >
//           Previous
//         </Button>
//         <Button
//           variant="default"
//           size="sm"
//           className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           1
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           className="h-8 w-8 p-0 text-gray-600 border-gray-200 hover:bg-gray-50"
//         >
//           2
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           className="h-8 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Pagination;

import { Button } from "../ui/button";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between mt-6 p-4 border-t border-gray-100">
      <p className="lg:text-sm text-xs text-gray-500">
        Showing {startItem} to {endItem} of {totalItems} results
      </p>

      <div className="flex items-center gap-2">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-gray-600 border-gray-200"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;

          return (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 ${
                page === currentPage
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
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
