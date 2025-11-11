import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import UserModal from "../components/UserModal";
import Pagination from "../components/Pagination";
import { AdvancedSearch } from "../components/AdvancedSearch";
import { useAdvancedSearch } from "../hooks/useAdvancedSearch";
import { usersAPI, authAPI } from "../services/api";
import { exportToExcel, exportToCSV, formatDate } from "../utils/export";
import { useDataSync } from "../hooks/useDataSync";

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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "master":
        return "bg-purple-100 text-purple-800";
      case "client":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Загрузка пользователей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Пользователи</h2>
                  <p className="text-gray-600 mt-2">
                    Управление пользователями системы
                  </p>
                </div>
            <div className="flex gap-3">
              {/* Экспорт */}
              <div className="relative group">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Экспорт
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => handleExport("excel")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📊 Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📄 CSV (.csv)
                  </button>
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + Добавить пользователя
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
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
                <div className="mt-4 text-sm text-gray-600">
                  Найдено: {finalFilteredUsers.length} из {users.length}
                  {finalFilteredUsers.length !== users.length && (
                    <span className="ml-2 text-blue-600">
                      (Экспорт будет применен к отфильтрованным данным)
                    </span>
                  )}
            </div>
          </div>

          {finalFilteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchQuery || filters.length > 0
                  ? "Не найдено пользователей, соответствующих критериям поиска"
                  : "Нет пользователей"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {(user.firstName?.[0] || user.email[0])?.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>

              {/* Пагинация */}
              <div className="mt-4">
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
          </div>
        </div>
      </div>

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

