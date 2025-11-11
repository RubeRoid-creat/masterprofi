import { useState, useEffect } from "react";
import { financeAPI } from "../../services/api/financeApi";
import RevenueChart from "./components/RevenueChart";
import ExpenseTracker from "./components/ExpenseTracker";
import PayoutManager from "./components/PayoutManager";

export default function FinanceDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await financeAPI.getOverview();
      setOverview(data);
    } catch (error) {
      console.error("Failed to load finance overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Финансовый контроль
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Аналитика доходов, расходов и выплат
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Доходы</div>
          <div className="text-2xl font-bold">{overview?.revenue || 0} ₽</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Расходы</div>
          <div className="text-2xl font-bold">{overview?.expenses || 0} ₽</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Прибыль</div>
          <div className="text-2xl font-bold">{overview?.profit || 0} ₽</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Комиссии</div>
          <div className="text-2xl font-bold">{overview?.commissions || 0} ₽</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RevenueChart />
        <ExpenseTracker />
      </div>

      <div className="mt-6">
        <PayoutManager />
      </div>
    </div>
  );
}





