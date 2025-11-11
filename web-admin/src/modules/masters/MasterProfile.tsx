import { useState, useEffect } from "react";
import { mastersAPI } from "../../services/api/mastersApi";

interface MasterProfileProps {
  masterId: string;
  onBack: () => void;
}

export default function MasterProfile({ masterId, onBack }: MasterProfileProps) {
  const [master, setMaster] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaster();
  }, [masterId]);

  const loadMaster = async () => {
    try {
      setLoading(true);
      const [masterData, performanceData] = await Promise.all([
        mastersAPI.getById(masterId),
        mastersAPI.getPerformance(masterId),
      ]);
      setMaster(masterData);
      setPerformance(performanceData);
    } catch (error) {
      console.error("Failed to load master:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!master) {
    return <div>Мастер не найден</div>;
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800">
        ← Назад к списку
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Профиль мастера</h2>

        {performance && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-gray-600">Завершенных заказов</div>
              <div className="text-2xl font-bold">{performance.completedOrders}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600">Рейтинг</div>
              <div className="text-2xl font-bold">{performance.averageRating.toFixed(1)}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-sm text-gray-600">Процент завершения</div>
              <div className="text-2xl font-bold">{performance.completionRate}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm text-gray-600">Время отклика</div>
              <div className="text-2xl font-bold">{performance.responseTime}м</div>
            </div>
          </div>
        )}

        {/* TODO: Add tabs for Skills, Certificates, Schedule, Service Area */}
      </div>
    </div>
  );
}





