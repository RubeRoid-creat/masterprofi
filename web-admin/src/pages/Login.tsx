import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { authAPI } from "../services/api";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      dispatch(
        setCredentials({
          user: response.user,
          token: response.access_token,
        })
      );
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error details:", {
        err,
        response: err.response,
        userMessage: err.userMessage,
        message: err.message,
        code: err.code,
        config: err.config
      });
      
      // Обрабатываем различные типы ошибок
      if (err.userMessage) {
        setError(err.userMessage);
      } else if (err.response?.data) {
        // Обработка ошибок валидации (400 Bad Request)
        if (err.response.status === 400) {
          const messages = err.response.data.message;
          if (Array.isArray(messages)) {
            setError("Ошибка валидации: " + messages.join(", "));
          } else if (typeof messages === "string") {
            setError(messages);
          } else {
            setError("Неверный формат данных. Проверьте email и пароль.");
          }
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Ошибка сервера: " + (err.response.data.error || "Неизвестная ошибка"));
        }
      } else if (!err.response && (err.code === "ERR_NETWORK" || err.message?.includes("Network Error") || err.code === "ECONNREFUSED")) {
        setError("Не удалось подключиться к серверу. Убедитесь, что backend запущен на http://localhost:3000");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(t("auth.loginError") || "Ошибка при входе в систему");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t("common.appName")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t("common.adminPanel")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@masterprofi.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t("auth.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.loggingIn") : t("auth.login")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.useAdminCredentials")}
          </p>
        </div>
      </div>
    </div>
  );
}

