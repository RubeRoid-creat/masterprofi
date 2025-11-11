import { useState, useEffect } from "react";
import { usersAPI, authAPI } from "../services/api";
import { Button, Card, Input, Alert, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, LoadingSpinner, Badge } from "../components/ui";

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function Profile() {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "activity">("profile");

  // Form states
  const [editForm, setEditForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
    loadActivity();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getProfile();
      setEditForm({
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const data = await usersAPI.getActivityHistory();
      setActivity(data);
    } catch (err: any) {
      console.error("Ошибка загрузки истории активности:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const updated = await usersAPI.updateProfile(editForm);
      setEditForm({
        email: updated.email || "",
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        phone: updated.phone || "",
        avatar: updated.avatar || "",
      });
      setSuccess("Профиль успешно обновлен");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка обновления профиля");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("Новые пароли не совпадают");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError("Новый пароль должен содержать минимум 6 символов");
        return;
      }

      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess("Пароль успешно изменен");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка смены пароля");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      LOGIN: "Вход в систему",
      LOGOUT: "Выход из системы",
      REGISTER: "Регистрация",
      USER_UPDATE: "Обновление профиля",
      TOKEN_REFRESH: "Обновление токена",
      ORDER_CREATED: "Создание заказа",
      ORDER_UPDATED: "Обновление заказа",
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 font-display">Профиль пользователя</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8">
            <Button
              variant={activeTab === "profile" ? "primary" : "ghost"}
              onClick={() => setActiveTab("profile")}
              className={`border-b-2 rounded-none ${
                activeTab === "profile"
                  ? "border-primary-500"
                  : "border-transparent"
              }`}
            >
              Редактирование профиля
            </Button>
            <Button
              variant={activeTab === "password" ? "primary" : "ghost"}
              onClick={() => setActiveTab("password")}
              className={`border-b-2 rounded-none ${
                activeTab === "password"
                  ? "border-primary-500"
                  : "border-transparent"
              }`}
            >
              Смена пароля
            </Button>
            <Button
              variant={activeTab === "activity" ? "primary" : "ghost"}
              onClick={() => setActiveTab("activity")}
              className={`border-b-2 rounded-none ${
                activeTab === "activity"
                  ? "border-primary-500"
                  : "border-transparent"
              }`}
            >
              История активности
            </Button>
          </nav>
        </div>

        {/* Messages */}
        {error && (
          <Alert
            variant="error"
            onClose={() => setError("")}
            className="mb-6 animate-slide-up"
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            variant="success"
            onClose={() => setSuccess("")}
            className="mb-6 animate-slide-up"
          >
            {success}
          </Alert>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="email"
                label="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                type="tel"
                label="Телефон"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />

              <Input
                type="text"
                label="Имя"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                type="text"
                label="Фамилия"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <div className="md:col-span-2">
                <Input
                  type="url"
                  label="URL аватара"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                Сохранить изменения
              </Button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-md animate-fade-in">
            <Input
              type="password"
              label="Текущий пароль"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Input
              type="password"
              label="Новый пароль"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
              minLength={6}
              helperText="Минимум 6 символов"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            />

            <Input
              type="password"
              label="Подтвердите новый пароль"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              required
              minLength={6}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                }
              >
                Изменить пароль
              </Button>
            </div>
          </form>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-fade-in">
            {activity.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">История активности пуста</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>IP адрес</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activity.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(log.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {log.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          {log.ipAddress || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

