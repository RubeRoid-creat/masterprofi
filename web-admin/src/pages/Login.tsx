import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { authAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import { Button, Input, Card } from "../components/ui";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 dark:from-primary-700 dark:via-secondary-700 dark:to-primary-800 p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        <Card variant="elevated" padding="lg" className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">{t("common.appName")}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t("common.adminPanel")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-700 text-error-700 dark:text-error-300 px-4 py-3 rounded-lg animate-slide-up">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <Input
              type="email"
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@masterprofi.com"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              type="password"
              label={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.useAdminCredentials")}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

