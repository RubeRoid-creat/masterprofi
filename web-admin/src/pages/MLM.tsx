import { useEffect, useState, useRef, useCallback } from "react";
import type React from "react";
import AddReferralModal from "../components/AddReferralModal";
import MLMTreeView from "../components/MLMTreeView";
import { mlmAPI } from "../services/api";
import { useAppSelector } from "../store/hooks";
import { useDataSync } from "../hooks/useDataSync";
import { Button, Card, Badge, StatCard } from "../components/ui";

export default function MLM() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<any>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [structure, setStructure] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddReferralModalOpen, setIsAddReferralModalOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  // Polling для автоматического обновления
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 30000; // 30 секунд для MLM
  const loadMLMDataRef = useRef<() => void>(() => {});

  // Auto-refetch при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      console.log('[MLM] Window focused, refreshing data...');
      if (user?.id) {
        loadMLMDataRef.current();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Polling для автоматического обновления
  useEffect(() => {
    if (!user?.id) return;
    
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(() => {
        console.log('[MLM] Polling: refreshing MLM data...');
        loadMLMDataRef.current();
      }, POLLING_INTERVAL);
    };
    startPolling();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadMLMData();
  }, [user]);

  const loadMLMData = useCallback(async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const [userStats, overall, userStructure, realTime] = await Promise.all([
        mlmAPI.getUserStats(user.id),
        mlmAPI.getOverallStats(),
        mlmAPI.getUserStructure(user.id),
        mlmAPI.getRealTimeCommissions(user.id),
      ]);

      setStats(userStats);
      setOverallStats(overall);
      setStructure(userStructure);
      setRealTimeData(realTime);
      setError("");
    } catch (err: any) {
      console.error('MLM error:', err);
      setError(err.response?.data?.message || "Ошибка загрузки MLM данных");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Обновляем ref при изменении loadMLMData
  useEffect(() => {
    loadMLMDataRef.current = loadMLMData;
  }, [loadMLMData]);

  // WebSocket синхронизация для MLM данных
  useDataSync({
    onMLMNetworkUpdated: useCallback((data: { userId: string; networkData: any }) => {
      console.log('[MLM] WebSocket: MLM network updated', data);
      if (user?.id === data.userId) {
        loadMLMDataRef.current();
      }
    }, [user]),
    onCommissionUpdated: useCallback((data: { userId: string; commission: any }) => {
      console.log('[MLM] WebSocket: Commission updated', data);
      if (user?.id === data.userId) {
        loadMLMDataRef.current();
      }
    }, [user]),
    onUserCreated: useCallback(() => {
      console.log('[MLM] User created, refreshing MLM data...');
      if (user?.id) {
        loadMLMDataRef.current();
      }
    }, [user]),
  });

  const handleAutomaticPayout = async () => {
    if (!user?.id) return;
    
    setPayoutLoading(true);
    try {
      const amount = stats?.statistics?.availableBalance || 0;
      const result = await mlmAPI.processAutomaticPayout(user.id, amount);
      if (result.success) {
        alert(result.message);
        await loadMLMData();
      } else {
        alert(result.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка при обработке выплаты");
    } finally {
      setPayoutLoading(false);
    }
  };

  const renderStructure = (level: any[], depth: number = 0): React.ReactNode[] => {
    if (!level || level.length === 0) {
      return [];
    }

    return level.map((node, index) => {
      // Убеждаемся что totalEarned это число
      const totalEarned = typeof node.totalEarned === 'number' ? node.totalEarned : parseFloat(node.totalEarned) || 0;
      
      return (
        <div key={node.id || index} className="ml-4">
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              depth === 0 ? "bg-blue-600" : depth === 1 ? "bg-green-600" : "bg-purple-600"
            }`}>
              {(node.firstName?.[0] || node.email[0]).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {node.firstName && node.lastName ? `${node.firstName} ${node.lastName}` : node.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Уровень {depth + 1} • Заказов: {node.ordersCount || 0}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {totalEarned.toFixed(2)} ₽
              </p>
            </div>
          </div>
          {node.children && node.children.length > 0 && renderStructure(node.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">MLM Система</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Партнерская программа и аналитика
          </p>
        </div>

        {error && (
          <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-300 px-4 py-3 rounded-lg mb-6 animate-slide-up">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        ) : (
          <>
            {/* Персональная статистика */}
            {stats && (
              <div className="mb-8 animate-slide-up">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-display">Ваша статистика</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Рефералов"
                    value={stats.referrals || 0}
                    variant="primary"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Заработано"
                    value={`${(stats.statistics?.totalEarnings || 0).toFixed(2)} ₽`}
                    variant="success"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Доступно"
                    value={`${(stats.statistics?.availableBalance || 0).toFixed(2)} ₽`}
                    variant="secondary"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Выплачено"
                    value={`${(stats.statistics?.withdrawnAmount || 0).toFixed(2)} ₽`}
                    variant="warning"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  />
                </div>
              </div>
            )}

            {/* Комиссионная структура */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Уровни комиссий</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {overallStats?.commissionRates?.map((level: any, index: number) => (
                  <div key={index} className={`bg-gradient-to-br rounded-lg shadow-md p-6 text-white ${
                    index === 0 ? "from-blue-500 to-blue-600" :
                    index === 1 ? "from-green-500 to-green-600" :
                    "from-purple-500 to-purple-600"
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold">Уровень {level.level}</h4>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">
                      {(level.commissionRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-white/80 mt-2">Комиссия</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Комиссии в реальном времени */}
            {realTimeData && (
              <Card variant="elevated" padding="lg" className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Комиссии в реальном времени
                  </h3>
                  <Button
                    variant="success"
                    onClick={handleAutomaticPayout}
                    disabled={payoutLoading || !stats?.statistics?.availableBalance || stats.statistics.availableBalance <= 0}
                    isLoading={payoutLoading}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  >
                    Автоматическая выплата
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ожидающие комиссии</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {realTimeData.pendingCommissions?.toFixed(2) || "0.00"} ₽
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Доступно к выплате</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {realTimeData.estimatedNextPayout?.toFixed(2) || "0.00"} ₽
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Недавние комиссии</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {realTimeData.recentCommissions?.length || 0}
                    </p>
                  </div>
                </div>
                {realTimeData.recentCommissions && realTimeData.recentCommissions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Последние комиссии:</h4>
                    <div className="space-y-2">
                      {realTimeData.recentCommissions.slice(0, 5).map((comm: any) => (
                        <div key={comm.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Уровень {comm.level}: {comm.amount.toFixed(2)} ₽
                            </span>
                            <Badge variant={comm.status === "paid" ? "success" : "warning"} size="sm" className="ml-2">
                              {comm.status === "paid" ? "Выплачено" : "Ожидает"}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comm.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Партнерская структура */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Ваша партнерская структура
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
                    <Button
                      variant={viewMode === "tree" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("tree")}
                    >
                      Дерево
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      Список
                    </Button>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setIsAddReferralModalOpen(true)}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    }
                  >
                    Добавить реферала
                  </Button>
                </div>
              </div>
              {structure && structure.length > 0 ? (
                viewMode === "tree" ? (
                  <MLMTreeView data={structure} rootUser={user || undefined} />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
                    {renderStructure(structure)}
                  </div>
                )
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <svg
                    className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    У вас пока нет рефералов
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Пригласите друзей и начните зарабатывать!
                  </p>
                  <button
                    onClick={() => setIsAddReferralModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Добавить реферала
                  </button>
                </div>
              )}
            </div>

            {/* Общая статистика */}
            {overallStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Общая статистика MLM
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Всего партнеров</h4>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold">{overallStats.totalReferrals || 0}</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Всего бонусов</h4>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold">{overallStats.totalBonuses || 0}</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Выплачено всего</h4>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold">
                      {(overallStats.totalPaidAmount || 0).toFixed(2)} ₽
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddReferralModal
        isOpen={isAddReferralModalOpen}
        onClose={() => {
          setIsAddReferralModalOpen(false);
          setError("");
        }}
        onSave={async (referralData) => {
          await mlmAPI.createReferral(referralData);
          loadMLMData();
        }}
        currentUserId={user?.id || ""}
      />
    </div>
  );
}
