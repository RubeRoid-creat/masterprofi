import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import UserModal from "../components/UserModal";
import Pagination from "../components/Pagination";
import { AdvancedSearch } from "../components/AdvancedSearch";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import { usersAPI, authAPI } from "../services/api";
import { exportToExcel, exportToCSV, formatDate } from "../utils/export";
import { useDataSync } from "../hooks/useDataSync";
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui";
import MobileTableCard from "../components/ui/MobileTableCard";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  
  // Расширенный поиск
  const {
    searchQuery,
    filters,
    filteredData,
    autocompleteSuggestions,
    showAutocomplete,
    searchHistory,
    savedFilters,
    handleSearchChange,
    handleSearchSubmit,
    setShowAutocomplete,
    addFilter,
    removeFilter,
    clearFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
  } = useAdvancedSearch({
    data: users,
    searchFields: ["email", "firstName", "lastName", "role"],
    storageKey: "users_search",
  });

  // Дополнительная фильтрация по роли и статусу
  const roleFilter = filters.find((f) => f.field === "role")?.value || "all";
  const statusFilter = filters.find((f) => f.field === "isActive")?.value || "all";

  const finalFilteredUsers = filteredData.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter === "active" && !user.isActive) return false;
    if (statusFilter === "inactive" && user.isActive) return false;
    return true;
  });

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Polling для автоматического обновления
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 15000; // 15 секунд
  const loadUsersRef = useRef<() => void>(() => {});

  // Auto-refetch при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Users] Window focused, refreshing data...');
      loadUsersRef.current();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Polling для автоматического обновления
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(() => {
        console.log('[Users] Polling: refreshing users...');
        loadUsersRef.current();
      }, POLLING_INTERVAL);
    };
    startPolling();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновляем ref при изменении loadUsers
  useEffect(() => {
    loadUsersRef.current = loadUsers;
  }, [loadUsers]);

  // WebSocket синхронизация
  useDataSync({
    onUserCreated: useCallback((user: any) => {
      console.log('[Users] WebSocket: New user created', user);
      loadUsersRef.current();
    }, []),
    onUserUpdated: useCallback((user: any) => {
      console.log('[Users] WebSocket: User updated', user);
      setUsers((prevUsers) => {
        const index = prevUsers.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          const newUsers = [...prevUsers];
          newUsers[index] = { ...newUsers[index], ...user };
          return newUsers;
        } else {
          return [...prevUsers, user];
        }
      });
    }, []),
    onProfileUpdated: useCallback((data: { userId: string; profile: any }) => {
      console.log('[Users] WebSocket: Profile updated', data);
      setUsers((prevUsers) => {
        const index = prevUsers.findIndex((u) => u.id === data.userId);
        if (index !== -1) {
          const newUsers = [...prevUsers];
          newUsers[index] = { ...newUsers[index], ...data.profile };
          return newUsers;
        }
        return prevUsers;
      });
    }, []),
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка удаления");
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSave = async (userData: any) => {
    try {
      if (modalMode === "create") {
        await authAPI.register(userData);
      } else if (selectedUser?.id) {
        await usersAPI.update(selectedUser.id, userData);
      }
      setIsModalOpen(false);
      loadUsers();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка сохранения пользователя");
    }
  };

  // Поля для расширенного поиска
  const availableFields = [
    { value: "email", label: "Электронная почта", type: "text" as const },
    { value: "firstName", label: "Имя", type: "text" as const },
    { value: "lastName", label: "Фамилия", type: "text" as const },
    { value: "role", label: "Роль", type: "text" as const },
    { value: "isActive", label: "Активен", type: "text" as const },
  ];

  // Пагинация
  const paginatedUsers = useMemo(() => {
    return finalFilteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [finalFilteredUsers, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(finalFilteredUsers.length / itemsPerPage);
  }, [finalFilteredUsers.length, itemsPerPage]);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters.length]);


  const getRoleBadgeVariant = (role: string): "primary" | "secondary" | "success" | "warning" | "error" | "info" | "gray" => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "error";
      case "master":
        return "primary";
      case "client":
        return "success";
      default:
        return "gray";
    }
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

  // Экспорт данных
  const handleExport = (format: "excel" | "csv") => {
    const columns = [
      { key: "email", label: "Email" },
      { 
        key: "firstName", 
        label: "Имя",
        format: (value: string) => value || "-"
      },
      { 
        key: "lastName", 
        label: "Фамилия",
        format: (value: string) => value || "-"
      },
      { 
        key: "role", 
        label: "Роль",
        format: (value: string) => getRoleLabel(value)
      },
      { 
        key: "isActive", 
        label: "Статус",
        format: (value: boolean) => value ? "Активен" : "Неактивен"
      },
      { 
        key: "createdAt", 
        label: "Дата регистрации",
        format: formatDate
      },
      { key: "id", label: "ID" },
    ];

    if (format === "excel") {
      exportToExcel(finalFilteredUsers, columns, {
        filename: `users_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: "Пользователи",
      });
    } else {
      exportToCSV(finalFilteredUsers, columns, {
        filename: `users_${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="lg" className="animate-fade-in">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">Загрузка пользователей...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card variant="elevated" padding="lg" className="animate-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">Пользователи</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Управление пользователями системы
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative group">
              <Button
                variant="success"
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                }
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Экспорт
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-medium py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleExport("excel")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  📊 Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  📄 CSV (.csv)
                </button>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Добавить пользователя
            </Button>
          </div>
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

        {/* Расширенный поиск */}
        <div className="mb-6">
          <AdvancedSearch
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            autocompleteSuggestions={autocompleteSuggestions}
            showAutocomplete={showAutocomplete}
            onShowAutocompleteChange={setShowAutocomplete}
            searchHistory={searchHistory}
            filters={filters}
            onAddFilter={addFilter}
            onRemoveFilter={removeFilter}
            onClearFilters={clearFilters}
            savedFilters={savedFilters}
            onSaveFilter={saveFilter}
            onLoadFilter={loadFilter}
            onDeleteFilter={deleteFilter}
            availableFields={availableFields}
          />
          
          {/* Счетчик результатов */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Найдено: <span className="font-semibold text-gray-900 dark:text-gray-100">{finalFilteredUsers.length}</span> из <span className="font-semibold text-gray-900 dark:text-gray-100">{users.length}</span>
            {finalFilteredUsers.length !== users.length && (
              <Badge variant="info" size="sm" className="ml-2">
                Экспорт к отфильтрованным данным
              </Badge>
            )}
          </div>
        </div>

        {finalFilteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filters.length > 0
                ? "Не найдено пользователей, соответствующих критериям поиска"
                : "Нет пользователей"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4">
              {paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Пользователи не найдены</p>
                </div>
              ) : (
                paginatedUsers.map((user) => (
                  <MobileTableCard
                    key={user.id}
                    title={user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                    subtitle={user.email}
                    badge={
                      <div className="flex gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge variant={user.isActive ? "success" : "error"} size="sm">
                          {user.isActive ? "Активен" : "Неактивен"}
                        </Badge>
                      </div>
                    }
                    fields={[
                      {
                        label: "Дата регистрации",
                        value: new Date(user.createdAt).toLocaleDateString("ru-RU"),
                      },
                    ]}
                    actions={
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          title="Редактировать"
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          }
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-error-600 hover:text-error-700"
                          title="Удалить"
                          leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          }
                        >
                          Удалить
                        </Button>
                      </>
                    }
                    onClick={() => handleEdit(user)}
                  />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {(user.firstName?.[0] || user.email[0])?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "error"} size="sm">
                          {user.isActive ? "Активен" : "Неактивен"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Пагинация */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={finalFilteredUsers.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  );
}

