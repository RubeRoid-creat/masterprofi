import { useState, useEffect } from "react";
import { customersAPI } from "../../services/api/customersApi";

interface CustomerProfileProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerProfile({ customerId, onBack }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.getById(customerId);
      setCustomer(data);
    } catch (error) {
      console.error("Failed to load customer:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!customer) {
    return <div>Клиент не найден</div>;
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800">
        ← Назад к списку
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {customer.firstName} {customer.lastName}
        </h2>

        {/* TODO: Add tabs for Overview, Orders, Appliances, Communications, Notes, Documents */}
      </div>
    </div>
  );
}





