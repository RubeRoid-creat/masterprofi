import { useState } from "react";

interface TreeNode {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  level: number;
  totalEarned: number;
  ordersCount: number;
  children?: TreeNode[];
}

interface MLMTreeViewProps {
  data: TreeNode[];
  rootUser?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function MLMTreeView({ data, rootUser }: MLMTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TreeNode, depth: number = 0, isLast: boolean = false, parentIsLast: boolean[] = []) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    const getLevelColor = (level: number) => {
      switch (level) {
        case 1:
          return "bg-blue-500 dark:bg-blue-600";
        case 2:
          return "bg-green-500 dark:bg-green-600";
        case 3:
          return "bg-purple-500 dark:bg-purple-600";
        default:
          return "bg-gray-500 dark:bg-gray-600";
      }
    };

    return (
      <div key={node.id} className="flex">
        {/* Вертикальные линии */}
        <div className="flex-shrink-0 w-6 relative">
          {depth > 0 && (
            <>
              {/* Верхняя линия */}
              <div
                className="absolute top-0 left-1/2 w-px h-4 bg-gray-300 dark:bg-gray-600"
                style={{ transform: "translateX(-50%)" }}
              />
              {/* Горизонтальная линия */}
              <div
                className="absolute top-4 left-1/2 w-3 h-px bg-gray-300 dark:bg-gray-600"
                style={{ transform: "translateX(-50%)" }}
              />
              {/* Вертикальная линия вниз (если не последний) */}
              {!isLast && (
                <div
                  className="absolute top-4 left-1/2 w-px h-full bg-gray-300 dark:bg-gray-600"
                  style={{ transform: "translateX(-50%)" }}
                />
              )}
              {/* Вертикальная линия через родительские узлы */}
              {parentIsLast.map((isLast, idx) => (
                !isLast && (
                  <div
                    key={idx}
                    className="absolute top-0 w-px h-full bg-gray-300 dark:bg-gray-600"
                    style={{
                      left: `${(idx + 1) * 24}px`,
                      transform: "translateX(-50%)",
                    }}
                  />
                )
              ))}
            </>
          )}
        </div>

        {/* Содержимое узла */}
        <div className="flex-1 mb-4">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              depth === 0
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
            }`}
          >
            {/* Аватар */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getLevelColor(
                node.level
              )}`}
            >
              {(node.firstName?.[0] || node.email[0] || "?").toUpperCase()}
            </div>

            {/* Информация */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {node.firstName && node.lastName
                    ? `${node.firstName} ${node.lastName}`
                    : node.email}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    node.level === 1
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : node.level === 2
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                  }`}
                >
                  Уровень {node.level}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span>Заказов: {node.ordersCount || 0}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {node.totalEarned.toFixed(2)} ₽
                </span>
              </div>
            </div>

            {/* Кнопка раскрытия */}
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.id)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isExpanded ? "Свернуть" : "Развернуть"}
              >
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Дочерние узлы */}
          {hasChildren && isExpanded && (
            <div className="ml-4 mt-2">
              {node.children!.map((child, idx) =>
                renderNode(
                  child,
                  depth + 1,
                  idx === node.children!.length - 1,
                  [...parentIsLast, isLast]
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-x-auto">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Структура команды
      </h3>
      <div className="min-w-max">
        {/* Корневой узел */}
        {rootUser && (
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {(rootUser.firstName?.[0] || rootUser.email[0] || "?").toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {rootUser.firstName && rootUser.lastName
                    ? `${rootUser.firstName} ${rootUser.lastName}`
                    : rootUser.email}
                </h3>
                <p className="text-blue-100 text-sm">Вы (Главный)</p>
              </div>
            </div>
          </div>
        )}

        {/* Дерево рефералов */}
        <div className="ml-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Пока нет рефералов</p>
              <p className="text-sm mt-2">Пригласите партнеров, чтобы начать зарабатывать</p>
            </div>
          ) : (
            data.map((node, idx) =>
              renderNode(node, 0, idx === data.length - 1, [])
            )
          )}
        </div>
      </div>
    </div>
  );
}

