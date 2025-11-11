import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  className,
  ...props
}: AlertProps) {
  const variantClasses = {
    info: 'bg-info-50 border-info-200 text-info-800 dark:bg-info-900/30 dark:border-info-700 dark:text-info-300',
    success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/30 dark:border-success-700 dark:text-success-300',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/30 dark:border-warning-700 dark:text-warning-300',
    error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/30 dark:border-error-700 dark:text-error-300',
  };

  const iconColors = {
    info: 'text-info-600 dark:text-info-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  };

  const defaultIcon = (
    <svg
      className={cn('w-5 h-5', iconColors[variant])}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      {variant === 'info' && (
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      )}
      {variant === 'success' && (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      )}
      {variant === 'warning' && (
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      )}
      {variant === 'error' && (
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0', iconColors[variant])}>
          {icon || defaultIcon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 -mt-1 -mr-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

