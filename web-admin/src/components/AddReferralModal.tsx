import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";

interface AddReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (referralData: { referrerId: string; referredId: string }) => void;
  currentUserId: string;
}

export default function AddReferralModal({
  isOpen,
  onClose,
  onSave,
  currentUserId,
}: AddReferralModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      // Фильтруем текущего пользователя и уже есть рефералы
      const filtered = data.filter((u: any) => u.id !== currentUserId);
      setUsers(filtered);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId) {
      setError("Выберите пользователя");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        referrerId: currentUserId,
        referredId: selectedUserId,
      });
      onClose();
    } catch (err) {
      setError("Ошибка при добавлении реферала");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Добавить реферала
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите пользователя *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName} (${user.email})`
                    : user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Важно:</strong> Пользователь станет вашим рефералом 1-го уровня. 
              Вы будете получать комиссию с его заказов.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Добавление..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

