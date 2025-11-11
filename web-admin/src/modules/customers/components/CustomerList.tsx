import { useState, useEffect } from "react";
import { customersAPI } from "../../../services/api/customersApi";
import DataTable from "../../../components/shared/DataTable/DataTable";

interface CustomerListProps {
  onSelectCustomer: (id: string) => void;
}

export default function CustomerList({ onSelectCustomer }: CustomerListProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll();
      // Обработка ответа - может быть {data: [], pagination: {}} или просто массив
      const customersData = response?.data || response || [];
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error: any) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "firstName", label: "Имя" },
    { key: "lastName", label: "Фамилия" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Телефон" },
    { key: "lifetimeValue", label: "LTV" },
    { key: "status", label: "Статус" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <DataTable
        data={customers}
        columns={columns}
        loading={loading}
        onRowClick={(row) => onSelectCustomer(row.id)}
      />
    </div>
  );
}

