import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function Layout({ children, currentPage = "dashboard" }: LayoutProps) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Админ";
      case "master":
        return "Мастер";
      case "client":
        return "Клиент";
      default:
        return role;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t("common.appName")}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("common.adminPanel")}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleLanguage();
              }}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-semibold text-gray-700 dark:text-gray-300"
              aria-label={t("language.toggle")}
              type="button"
              title={t("language.toggle")}
            >
              {language === "ru" ? "EN" : "RU"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleTheme();
              }}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label={t("theme.toggle")}
              type="button"
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5 text-gray-800 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-800 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user.firstName} {user.lastName}
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
              {getRoleLabel(user.role)}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              {t("auth.logout")}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleNavigate("/dashboard")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "dashboard"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.dashboard")}
            </button>
            <button
              onClick={() => handleNavigate("/users")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "users"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.users")}
            </button>
            <button
              onClick={() => handleNavigate("/orders")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "orders"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.orders")}
            </button>
            <button
              onClick={() => handleNavigate("/payments")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "payments"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.payments")}
            </button>
            <button
              onClick={() => handleNavigate("/mlm")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "mlm"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.mlm")}
            </button>
            <button
              onClick={() => handleNavigate("/reports")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "reports"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.reports")}
            </button>
            <button
              onClick={() => handleNavigate("/profile")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "profile"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {t("navigation.profile")}
            </button>
            {user?.role === "master" && (
              <button
                onClick={() => handleNavigate("/schedule")}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                  currentPage === "schedule"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                📅 Расписание
              </button>
            )}
            <button
              onClick={() => handleNavigate("/crm/sync")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "crm"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              🔄 CRM Синхронизация
            </button>
            <button
              onClick={() => handleNavigate("/crm/customers")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "customers"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              👥 Клиенты
            </button>
            <button
              onClick={() => handleNavigate("/crm/orders/kanban")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "orders"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              📋 Kanban Заказов
            </button>
            <button
              onClick={() => handleNavigate("/crm/masters")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "masters"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              🔧 Мастера
            </button>
            <button
              onClick={() => handleNavigate("/crm/finance")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200 ${
                currentPage === "finance"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              💰 Финансы
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

