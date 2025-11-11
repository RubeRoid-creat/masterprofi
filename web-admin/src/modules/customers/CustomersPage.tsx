import { useState } from "react";
import CustomerList from "./components/CustomerList";
import CustomerProfile from "./CustomerProfile";

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  if (selectedCustomerId) {
    return (
      <CustomerProfile
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Управление клиентами
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          База данных клиентов и управление взаимодействиями
        </p>
      </div>

      <CustomerList onSelectCustomer={setSelectedCustomerId} />
    </div>
  );
}





