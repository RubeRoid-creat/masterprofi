import { useEffect, useRef, useState } from "react";
import { geolocationAPI } from "../services/api";

interface Order {
  id: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: string;
  totalAmount: number;
  client?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Master {
  id: string;
  firstName?: string;
  lastName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  distance?: number;
}

interface OrdersMapProps {
  orders: Order[];
  selectedOrderId?: string;
  onOrderClick?: (order: Order) => void;
  showNearestMasters?: boolean;
  currentMasterLocation?: { latitude: number; longitude: number };
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function OrdersMap({
  orders,
  selectedOrderId,
  onOrderClick,
  showNearestMasters = false,
  currentMasterLocation,
}: OrdersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [nearestMasters, setNearestMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Проверяем наличие Yandex Maps API
    if (!window.ymaps) {
      console.warn("Yandex Maps API not loaded. Map functionality will be unavailable.");
      return;
    }

    // Инициализация карты
    window.ymaps.ready(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }

      const center = [55.7558, 37.6173]; // Москва по умолчанию
      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center,
        zoom: 10,
        controls: ["zoomControl", "fullscreenControl"],
      });

      // Очистка предыдущих объектов
      mapInstanceRef.current.geoObjects.removeAll();

      // Добавление меток заказов
      const orderObjects: any[] = [];

      orders.forEach((order) => {
        if (order.latitude && order.longitude) {
          const isSelected = order.id === selectedOrderId;
          const placemark = new window.ymaps.Placemark(
            [order.latitude, order.longitude],
            {
              balloonContentBody: `
                <div class="p-2">
                  <h3 class="font-bold">Заказ #${order.id.slice(0, 8)}</h3>
                  <p class="text-sm mt-1">${order.address || "Адрес не указан"}</p>
                  <p class="text-sm">${order.description || ""}</p>
                  <p class="text-sm font-semibold">Сумма: ${order.totalAmount} ₽</p>
                  <p class="text-sm">Статус: ${order.status}</p>
                  ${order.client ? `<p class="text-sm">Клиент: ${order.client.firstName} ${order.client.lastName}</p>` : ""}
                </div>
              `,
              hintContent: `Заказ #${order.id.slice(0, 8)}`,
            },
            {
              preset: isSelected
                ? "islands#redIcon"
                : order.status === "completed"
                ? "islands#greenIcon"
                : order.status === "in_progress"
                ? "islands#blueIcon"
                : "islands#yellowIcon",
            }
          );

          placemark.events.add("click", () => {
            if (onOrderClick) {
              onOrderClick(order);
            }
          });

          orderObjects.push(placemark);
        }
      });

      // Добавление меток мастеров
      nearestMasters.forEach((master) => {
        if (master.latitude && master.longitude) {
          const placemark = new window.ymaps.Placemark(
            [master.latitude, master.longitude],
            {
              balloonContentBody: `
                <div class="p-2">
                  <h3 class="font-bold">${master.firstName} ${master.lastName}</h3>
                  <p class="text-sm">${master.address || "Адрес не указан"}</p>
                  ${master.distance ? `<p class="text-sm">Расстояние: ${master.distance.toFixed(1)} км</p>` : ""}
                </div>
              `,
              hintContent: `${master.firstName} ${master.lastName}`,
            },
            {
              preset: "islands#blueCircleDotIcon",
            }
          );
          orderObjects.push(placemark);
        }
      });

      // Добавление текущей позиции мастера
      if (currentMasterLocation) {
        const placemark = new window.ymaps.Placemark(
          [currentMasterLocation.latitude, currentMasterLocation.longitude],
          {
            balloonContentBody: `
              <div class="p-2">
                <h3 class="font-bold">Ваше местоположение</h3>
              </div>
            `,
            hintContent: "Ваше местоположение",
          },
          {
            preset: "islands#redCircleDotIcon",
          }
        );
        orderObjects.push(placemark);
      }

      // Добавление всех объектов на карту
      orderObjects.forEach((obj) => {
        mapInstanceRef.current.geoObjects.add(obj);
      });

      // Автоматическое изменение масштаба для показа всех объектов
      if (orderObjects.length > 0) {
        mapInstanceRef.current.setBounds(
          mapInstanceRef.current.geoObjects.getBounds(),
          {
            checkZoomRange: true,
            duration: 300,
          }
        );
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [orders, selectedOrderId, nearestMasters, currentMasterLocation, onOrderClick]);

  // Загрузка ближайших мастеров для выбранного заказа
  useEffect(() => {
    if (showNearestMasters && selectedOrderId) {
      const selectedOrder = orders.find((o) => o.id === selectedOrderId);
      if (selectedOrder?.latitude && selectedOrder?.longitude) {
        setLoading(true);
        geolocationAPI
          .findNearestMasters(
            selectedOrder.latitude,
            selectedOrder.longitude,
            50,
            10
          )
          .then((data) => {
            setNearestMasters(data || []);
          })
          .catch((error) => {
            console.error("Error fetching nearest masters:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setNearestMasters([]);
    }
  }, [selectedOrderId, showNearestMasters, orders]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />
      {loading && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-lg">
          <p className="text-sm">Загрузка ближайших мастеров...</p>
        </div>
      )}
      {showNearestMasters && nearestMasters.length > 0 && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-xs">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">
            Ближайшие мастера ({nearestMasters.length})
          </h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {nearestMasters.map((master) => (
              <li
                key={master.id}
                className="text-sm border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0"
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {master.firstName} {master.lastName}
                </p>
                {master.distance && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {master.distance.toFixed(1)} км
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

