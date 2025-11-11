interface OrderCardProps {
  order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition-shadow">
      <div className="font-semibold text-sm mb-1">{order.id.slice(0, 8)}</div>
      <div className="text-xs text-gray-600 mb-2">
        {order.customer?.firstName} {order.customer?.lastName}
      </div>
      <div className="text-xs text-gray-500">
        {order.applianceType || "Бытовая техника"}
      </div>
      {order.master && (
        <div className="mt-2 text-xs text-blue-600">
          Мастер: {order.master.firstName}
        </div>
      )}
    </div>
  );
}





