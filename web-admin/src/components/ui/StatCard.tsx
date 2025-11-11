import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import Card from './Card';
import Badge from './Badge';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, subtitle, icon, trend, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'border-l-4 border-l-primary-500',
      secondary: 'border-l-4 border-l-secondary-500',
      success: 'border-l-4 border-l-success-500',
      warning: 'border-l-4 border-l-warning-500',
      error: 'border-l-4 border-l-error-500',
    };

    const formatValue = (val: string | number): string => {
      if (typeof val === 'number') {
        if (val >= 1000000) {
          return `${(val / 1000000).toFixed(1)}M`;
        }
        if (val >= 1000) {
          return `${(val / 1000).toFixed(1)}K`;
        }
        return val.toLocaleString('ru-RU');
      }
      return val;
    };

    return (
      <Card
        ref={ref}
        variant="default"
        padding="md"
        className={cn('hover:shadow-medium transition-all duration-200 group', variants[variant], className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center">
                <Badge
                  variant={trend.isPositive ? 'success' : 'error'}
                  size="sm"
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Badge>
              </div>
            )}
          </div>
          {icon && (
            <div className="ml-4 p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:scale-110 transition-transform duration-200">
              <div className="text-primary-600 dark:text-primary-400">
                {icon}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;

