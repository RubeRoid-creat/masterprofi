import { useState } from "react";
import { reportsAPI } from "../services/api";
import { Button, Card, Input, Select, Alert } from "../components/ui";

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
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">Отчеты</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Генерация отчетов в PDF формате
          </p>
        </div>

        {error && (
          <Alert
            variant="error"
            onClose={() => setError("")}
            className="mb-6 animate-slide-up"
          >
            {error}
          </Alert>
        )}

        {/* Выбор типа отчета */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Тип отчета
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              variant={reportType === "orders" ? "elevated" : "outlined"}
              padding="md"
              className={`cursor-pointer transition-all duration-200 ${
                reportType === "orders"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "hover:border-primary-300 hover:shadow-md"
              }`}
              onClick={() => setReportType("orders")}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">Отчет по заказам</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Статистика по заказам и их статусам
              </div>
            </Card>

            <Card
              variant={reportType === "mlm" ? "elevated" : "outlined"}
              padding="md"
              className={`cursor-pointer transition-all duration-200 ${
                reportType === "mlm"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "hover:border-primary-300 hover:shadow-md"
              }`}
              onClick={() => setReportType("mlm")}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">Отчет по MLM</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Статистика по комиссиям и мастерам
              </div>
            </Card>

            <Card
              variant={reportType === "financial" ? "elevated" : "outlined"}
              padding="md"
              className={`cursor-pointer transition-all duration-200 ${
                reportType === "financial"
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "hover:border-primary-300 hover:shadow-md"
              }`}
              onClick={() => setReportType("financial")}
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">Финансовый отчет</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Доходы, расходы и платежи
              </div>
            </Card>
          </div>
        </div>

        {/* Фильтры для отчета по заказам */}
        {reportType === "orders" && (
          <Card variant="flat" padding="md" className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Фильтры</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Начальная дата"
                value={ordersFilters.startDate}
                onChange={(e) =>
                  setOrdersFilters({
                    ...ordersFilters,
                    startDate: e.target.value,
                  })
                }
              />
              <Input
                type="date"
                label="Конечная дата"
                value={ordersFilters.endDate}
                onChange={(e) =>
                  setOrdersFilters({
                    ...ordersFilters,
                    endDate: e.target.value,
                  })
                }
              />
              <Select
                label="Статус"
                value={ordersFilters.status}
                onChange={(e) =>
                  setOrdersFilters({
                    ...ordersFilters,
                    status: e.target.value,
                  })
                }
                options={[
                  { value: "", label: "Все статусы" },
                  { value: "created", label: "Создан" },
                  { value: "assigned", label: "Назначен" },
                  { value: "in_progress", label: "В работе" },
                  { value: "completed", label: "Завершен" },
                  { value: "cancelled", label: "Отменен" },
                ]}
              />
              <Input
                type="text"
                label="ID клиента (опционально)"
                value={ordersFilters.clientId}
                onChange={(e) =>
                  setOrdersFilters({
                    ...ordersFilters,
                    clientId: e.target.value,
                  })
                }
                placeholder="UUID клиента"
              />
              <Input
                type="text"
                label="ID мастера (опционально)"
                value={ordersFilters.masterId}
                onChange={(e) =>
                  setOrdersFilters({
                    ...ordersFilters,
                    masterId: e.target.value,
                  })
                }
                placeholder="UUID мастера"
              />
            </div>
          </Card>
        )}

        {/* Фильтры для MLM отчета */}
        {reportType === "mlm" && (
          <Card variant="flat" padding="md" className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Фильтры</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Начальная дата"
                value={mlmFilters.startDate}
                onChange={(e) =>
                  setMlmFilters({
                    ...mlmFilters,
                    startDate: e.target.value,
                  })
                }
              />
              <Input
                type="date"
                label="Конечная дата"
                value={mlmFilters.endDate}
                onChange={(e) =>
                  setMlmFilters({
                    ...mlmFilters,
                    endDate: e.target.value,
                  })
                }
              />
              <Input
                type="text"
                label="ID мастера (опционально)"
                value={mlmFilters.masterId}
                onChange={(e) =>
                  setMlmFilters({
                    ...mlmFilters,
                    masterId: e.target.value,
                  })
                }
                placeholder="UUID мастера"
              />
            </div>
          </Card>
        )}

        {/* Фильтры для финансового отчета */}
        {reportType === "financial" && (
          <Card variant="flat" padding="md" className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Фильтры</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Начальная дата"
                value={financialFilters.startDate}
                onChange={(e) =>
                  setFinancialFilters({
                    ...financialFilters,
                    startDate: e.target.value,
                  })
                }
              />
              <Input
                type="date"
                label="Конечная дата"
                value={financialFilters.endDate}
                onChange={(e) =>
                  setFinancialFilters({
                    ...financialFilters,
                    endDate: e.target.value,
                  })
                }
              />
              <Select
                label="Статус платежа"
                value={financialFilters.paymentStatus}
                onChange={(e) =>
                  setFinancialFilters({
                    ...financialFilters,
                    paymentStatus: e.target.value,
                  })
                }
                options={[
                  { value: "", label: "Все статусы" },
                  { value: "pending", label: "Ожидает" },
                  { value: "processing", label: "Обрабатывается" },
                  { value: "completed", label: "Завершен" },
                  { value: "failed", label: "Ошибка" },
                  { value: "refunded", label: "Возвращен" },
                ]}
              />
            </div>
          </Card>
        )}

        {/* Кнопка генерации */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateReport}
            isLoading={loading}
            leftIcon={
              !loading && (
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
              )
            }
          >
            {loading ? "Генерация..." : "Сгенерировать отчет"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

