import { useState } from "react";
import { reportsAPI } from "../services/api";

type ReportType = "orders" | "mlm" | "financial";

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("orders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Фильтры для отчета по заказам
  const [ordersFilters, setOrdersFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    clientId: "",
    masterId: "",
  });

  // Фильтры для MLM отчета
  const [mlmFilters, setMlmFilters] = useState({
    startDate: "",
    endDate: "",
    masterId: "",
  });

  // Фильтры для финансового отчета
  const [financialFilters, setFinancialFilters] = useState({
    startDate: "",
    endDate: "",
    paymentStatus: "",
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError("");

      // Очищаем пустые строки и преобразуем в undefined перед отправкой
      const cleanOrdersFilters = Object.fromEntries(
        Object.entries(ordersFilters)
          .filter(([_, v]) => v !== "")
          .map(([k, v]) => [k, v === "" ? undefined : v])
      );
      const cleanMlmFilters = Object.fromEntries(
        Object.entries(mlmFilters)
          .filter(([_, v]) => v !== "")
          .map(([k, v]) => [k, v === "" ? undefined : v])
      );
      const cleanFinancialFilters = Object.fromEntries(
        Object.entries(financialFilters)
          .filter(([_, v]) => v !== "")
          .map(([k, v]) => [k, v === "" ? undefined : v])
      );

      let response;
      let filename = "";

      if (reportType === "orders") {
        response = await reportsAPI.generateOrdersReport(cleanOrdersFilters);
        filename = `orders_report_${new Date().toISOString().split("T")[0]}.pdf`;
      } else if (reportType === "mlm") {
        response = await reportsAPI.generateMLMReport(cleanMlmFilters);
        filename = `mlm_report_${new Date().toISOString().split("T")[0]}.pdf`;
      } else {
        response = await reportsAPI.generateFinancialReport(cleanFinancialFilters);
        filename = `financial_report_${new Date().toISOString().split("T")[0]}.pdf`;
      }

      // Создаем blob и скачиваем файл
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Report generation error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Ошибка генерации отчета";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Отчеты</h2>
            <p className="text-gray-600 mt-2">
              Генерация отчетов в PDF формате
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Выбор типа отчета */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип отчета
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setReportType("orders")}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  reportType === "orders"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold">Отчет по заказам</div>
                <div className="text-sm text-gray-600 mt-1">
                  Статистика по заказам и их статусам
                </div>
              </button>

              <button
                onClick={() => setReportType("mlm")}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  reportType === "mlm"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold">Отчет по MLM</div>
                <div className="text-sm text-gray-600 mt-1">
                  Статистика по комиссиям и мастерам
                </div>
              </button>

              <button
                onClick={() => setReportType("financial")}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  reportType === "financial"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold">Финансовый отчет</div>
                <div className="text-sm text-gray-600 mt-1">
                  Доходы, расходы и платежи
                </div>
              </button>
            </div>
          </div>

          {/* Фильтры для отчета по заказам */}
          {reportType === "orders" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">Фильтры</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Начальная дата
                  </label>
                  <input
                    type="date"
                    value={ordersFilters.startDate}
                    onChange={(e) =>
                      setOrdersFilters({
                        ...ordersFilters,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Конечная дата
                  </label>
                  <input
                    type="date"
                    value={ordersFilters.endDate}
                    onChange={(e) =>
                      setOrdersFilters({
                        ...ordersFilters,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={ordersFilters.status}
                    onChange={(e) =>
                      setOrdersFilters({
                        ...ordersFilters,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Все статусы</option>
                    <option value="created">Создан</option>
                    <option value="assigned">Назначен</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершен</option>
                    <option value="cancelled">Отменен</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID клиента (опционально)
                  </label>
                  <input
                    type="text"
                    value={ordersFilters.clientId}
                    onChange={(e) =>
                      setOrdersFilters({
                        ...ordersFilters,
                        clientId: e.target.value,
                      })
                    }
                    placeholder="UUID клиента"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID мастера (опционально)
                  </label>
                  <input
                    type="text"
                    value={ordersFilters.masterId}
                    onChange={(e) =>
                      setOrdersFilters({
                        ...ordersFilters,
                        masterId: e.target.value,
                      })
                    }
                    placeholder="UUID мастера"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Фильтры для MLM отчета */}
          {reportType === "mlm" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">Фильтры</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Начальная дата
                  </label>
                  <input
                    type="date"
                    value={mlmFilters.startDate}
                    onChange={(e) =>
                      setMlmFilters({
                        ...mlmFilters,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Конечная дата
                  </label>
                  <input
                    type="date"
                    value={mlmFilters.endDate}
                    onChange={(e) =>
                      setMlmFilters({
                        ...mlmFilters,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID мастера (опционально)
                  </label>
                  <input
                    type="text"
                    value={mlmFilters.masterId}
                    onChange={(e) =>
                      setMlmFilters({
                        ...mlmFilters,
                        masterId: e.target.value,
                      })
                    }
                    placeholder="UUID мастера"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Фильтры для финансового отчета */}
          {reportType === "financial" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">Фильтры</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Начальная дата
                  </label>
                  <input
                    type="date"
                    value={financialFilters.startDate}
                    onChange={(e) =>
                      setFinancialFilters({
                        ...financialFilters,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Конечная дата
                  </label>
                  <input
                    type="date"
                    value={financialFilters.endDate}
                    onChange={(e) =>
                      setFinancialFilters({
                        ...financialFilters,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус платежа
                  </label>
                  <select
                    value={financialFilters.paymentStatus}
                    onChange={(e) =>
                      setFinancialFilters({
                        ...financialFilters,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Все статусы</option>
                    <option value="pending">Ожидает</option>
                    <option value="processing">Обрабатывается</option>
                    <option value="completed">Завершен</option>
                    <option value="failed">Ошибка</option>
                    <option value="refunded">Возвращен</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка генерации */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Генерация...
                </>
              ) : (
                <>
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Сгенерировать отчет
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

