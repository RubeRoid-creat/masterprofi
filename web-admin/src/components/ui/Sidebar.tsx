import { HTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface SidebarItem {
  label: string;
  path: string;
  icon?: ReactNode;
  badge?: number | string;
  children?: SidebarItem[];
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  items,
  currentPath,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  className,
  ...props
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.path);
    const active = isActive(item.path);

    return (
      <div key={item.path}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.path);
            } else {
              onNavigate(item.path);
            }
          }}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            active && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
            !active && 'text-gray-700 dark:text-gray-300',
            level > 0 && 'pl-8'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {item.icon && (
              <span className={cn(
                'flex-shrink-0',
                active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              )}>
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <svg
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isExpanded && 'transform rotate-90'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          )}
        </button>
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
      {...props}
    >
      <div className="flex flex-col h-full">
        {onToggleCollapse && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-full"
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                  />
                </svg>
              }
            >
              {!collapsed && 'Свернуть'}
            </Button>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map((item) => renderItem(item))}
        </nav>
      </div>
    </aside>
  );
}

