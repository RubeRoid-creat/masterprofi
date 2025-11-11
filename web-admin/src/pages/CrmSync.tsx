import { useState, useEffect } from "react";
import { crmAPI } from "../services/api";
import { useNotifications } from "../contexts/NotificationContext";
import { useAppSelector } from "../store/hooks";

interface SyncStatus {
  id: string;
  userId: string;
  crmType?: string;
  lastSyncAt?: string;
  lastFullSyncAt?: string;
  isSyncing: boolean;
  totalContacts: number;
  totalDeals: number;
  totalTasks: number;
  pendingChanges: number;
  lastError?: string;
}


export default function CrmSync() {
  const { showNotification } = useNotifications();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Загружаем данные только если пользователь авторизован
    if (isAuthenticated && token) {
      loadData();
    }
  }, [isAuthenticated, token]);

  const loadData = async () => {
    // Проверяем авторизацию перед запросом
    if (!isAuthenticated || !token) {
      console.warn("User not authenticated, skipping CRM sync data load");
      return;
    }

    try {
      setLoading(true);
      const status = await crmAPI.getSyncStatus();
      setSyncStatus(status);
    } catch (error: any) {
      console.error("Failed to load CRM sync data:", error);
      // Не показываем ошибку, если это просто 401 (пользователь не авторизован)
      if (error.response?.status !== 401) {
        showNotification({
          type: "error",
          title: "Ошибка",
          message: error.userMessage || "Не удалось загрузить данные синхронизации",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleInitialSync = async () => {
    if (!isAuthenticated || !token) {
      showNotification({
        type: "error",
        title: "Ошибка",
        message: "Требуется авторизация",
      });
      return;
    }

    try {
      setSyncing(true);
      await crmAPI.initialSync();
      showNotification({
        type: "success",
        title: "Успешно",
        message: "Полная синхронизация запущена",
      });
      setTimeout(() => loadData(), 2000);
    } catch (error: any) {
      console.error("Initial sync failed:", error);
      showNotification({
        type: "error",
        title: "Ошибка",
        message: error.userMessage || "Ошибка синхронизации",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleIncrementalSync = async () => {
    if (!isAuthenticated || !token) {
      showNotification({
        type: "error",
        title: "Ошибка",
        message: "Требуется авторизация",
      });
      return;
    }

    try {
      setSyncing(true);
      await crmAPI.incrementalSync();
      showNotification({
        type: "success",
        title: "Успешно",
        message: "Инкрементальная синхронизация завершена",
      });
      await loadData();
    } catch (error: any) {
      console.error("Incremental sync failed:", error);
      showNotification({
        type: "error",
        title: "Ошибка",
        message: error.userMessage || "Ошибка синхронизации",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Синхронизация CRM</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
        >
          {refreshing ? "Обновление..." : "Обновить"}
        </button>
      </div>

      {/* Статус синхронизации */}
      {syncStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Статус синхронизации</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Контактов</p>
              <p className="text-2xl font-bold">{syncStatus.totalContacts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Сделок</p>
              <p className="text-2xl font-bold">{syncStatus.totalDeals}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Задач</p>
              <p className="text-2xl font-bold">{syncStatus.totalTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ожидающих</p>
              <p className="text-2xl font-bold">{syncStatus.pendingChanges}</p>
            </div>
          </div>
          {syncStatus.lastSyncAt && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Последняя синхронизация:{" "}
                <span className="font-medium">
                  {new Date(syncStatus.lastSyncAt).toLocaleString("ru-RU")}
                </span>
              </p>
            </div>
          )}
          {syncStatus.isSyncing && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">Синхронизация в процессе...</span>
            </div>
          )}
          {syncStatus.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">{syncStatus.lastError}</p>
            </div>
          )}
        </div>
      )}

      {/* Действия */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Действия</h2>
        <div className="flex gap-4">
          <button
            onClick={handleInitialSync}
            disabled={syncing}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? "Синхронизация..." : "Полная синхронизация"}
          </button>
          <button
            onClick={handleIncrementalSync}
            disabled={syncing}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? "Синхронизация..." : "Инкрементальная синхронизация"}
          </button>
        </div>
      </div>
    </div>
  );
}

