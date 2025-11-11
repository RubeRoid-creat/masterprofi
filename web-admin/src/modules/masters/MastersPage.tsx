import { useState } from "react";
import MasterDirectory from "./components/MasterDirectory";
import MasterProfile from "./MasterProfile";

export default function MastersPage() {
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  if (selectedMasterId) {
    return (
      <MasterProfile
        masterId={selectedMasterId}
        onBack={() => setSelectedMasterId(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Управление мастерами
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          База данных мастеров, навыки и производительность
        </p>
      </div>

      <MasterDirectory onSelectMaster={setSelectedMasterId} />
    </div>
  );
}





