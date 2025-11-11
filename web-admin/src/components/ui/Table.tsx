import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTheadElement> {
  children: ReactNode;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTBodyElement> {
  children: ReactNode;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hover?: boolean;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table
          ref={ref}
          className={cn(
            'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn(
          'bg-gray-50 dark:bg-gray-800/50',
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn(
          'bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700',
          className
        )}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, hover = true, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          hover && 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable = false, sorted = null, onSort, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
          sortable && 'cursor-pointer select-none',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <span className="flex flex-col">
              <svg
                className={cn(
                  'w-3 h-3 transition-opacity',
                  sorted === 'asc' ? 'opacity-100 text-primary-600' : 'opacity-30'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
              </svg>
              <svg
                className={cn(
                  'w-3 h-3 transition-opacity -mt-1',
                  sorted === 'desc' ? 'opacity-100 text-primary-600' : 'opacity-30'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 8a1 1 0 102 0v5.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 13.586V8z" />
              </svg>
            </span>
          )}
        </div>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

export { TableHeader, TableBody, TableRow, TableHead, TableCell };
export default Table;

