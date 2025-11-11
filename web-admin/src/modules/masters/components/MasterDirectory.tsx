import { useState, useEffect } from "react";
import { mastersAPI } from "../../../services/api/mastersApi";
import DataTable from "../../../components/shared/DataTable/DataTable";

interface MasterDirectoryProps {
  onSelectMaster: (id: string) => void;
}

export default function MasterDirectory({ onSelectMaster }: MasterDirectoryProps) {
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      setLoading(true);
      const response = await mastersAPI.getAll();
      // Обработка ответа - может быть {data: [], pagination: {}} или просто массив
      const mastersData = response?.data || response || [];
      setMasters(Array.isArray(mastersData) ? mastersData : []);
    } catch (error: any) {
      console.error("Failed to load masters:", error);
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "rank", label: "Ранг" },
    { key: "averageRating", label: "Рейтинг" },
    { key: "totalOrders", label: "Заказов" },
    { key: "completedOrders", label: "Завершено" },
    { key: "isAvailable", label: "Доступен" },
    { key: "isActive", label: "Активен" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <DataTable
        data={masters}
        columns={columns}
        loading={loading}
        onRowClick={(row) => onSelectMaster(row.id)}
      />
    </div>
  );
}

