import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';

export interface MobileTableCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  fields: Array<{
    label: string;
    value: ReactNode;
    className?: string;
  }>;
  onClick?: () => void;
}

export default function MobileTableCard({
  title,
  subtitle,
  badge,
  actions,
  fields,
  onClick,
  className,
  ...props
}: MobileTableCardProps) {
  return (
    <Card
      variant="outlined"
      padding="md"
      className={cn(
        'space-y-3',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {(title || badge) && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1',
              field.className
            )}
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {field.label}
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {actions}
        </div>
      )}
    </Card>
  );
}

