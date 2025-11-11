import React, { useState } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages?: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  sortable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
}

export default function DataTable({
  data,
  columns,
  loading = false,
  onRowClick,
  pagination,
  onPageChange,
  onSort,
  sortable = false,
  selectable = false,
  onSelectionChange,
}: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (!sortable || !onSort) return;

    const newDirection =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort(columnKey, newDirection);
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
    if (onSelectionChange) {
      const selected = data.filter((row) => newSelected.has(row.id || row._id));
      onSelectionChange(selected);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((row) => row.id || row._id).filter(Boolean);
      setSelectedRows(new Set(allIds));
      if (onSelectionChange) {
        onSelectionChange(data);
      }
    } else {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {selectable && (
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                  sortable && column.sortable !== false
                    ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortable && sortColumn === column.key && (
                    <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                Нет данных для отображения
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const rowId = row.id || row._id || index.toString();
              return (
                <tr
                  key={rowId}
                  onClick={() => !selectable && onRowClick?.(row)}
                  className={`${
                    onRowClick && !selectable
                      ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      : ""
                  } ${selectedRows.has(rowId) ? "bg-blue-50 dark:bg-blue-900" : ""}`}
                >
                  {selectable && (
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowId)}
                        onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Показано {((pagination.page - 1) * pagination.pageSize) + 1} -{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} из{" "}
            {pagination.total}
          </div>
          {onPageChange && pagination.totalPages && pagination.totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <span className="px-3 py-1">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

