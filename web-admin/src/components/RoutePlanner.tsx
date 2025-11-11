import { useEffect, useRef, useState } from "react";
import { geolocationAPI } from "../services/api";

interface Order {
  id: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

interface RoutePlannerProps {
  startPoint: { latitude: number; longitude: number };
  orders: Order[];
  onRouteCalculated?: (route: { latitude: number; longitude: number }[]) => void;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function RoutePlanner({
  startPoint,
  orders,
  onRouteCalculated,
}: RoutePlannerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const multiRouteRef = useRef<any>(null);
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Проверяем наличие Yandex Maps API
    if (!window.ymaps) {
      console.warn("Yandex Maps API not loaded. Route planning will be unavailable.");
      return;
    }

    // Инициализация карты
    window.ymaps.ready(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }

      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [startPoint.latitude, startPoint.longitude],
        zoom: 11,
        controls: ["zoomControl", "fullscreenControl", "routeButtonControl"],
      });

      // Очистка предыдущих объектов
      mapInstanceRef.current.geoObjects.removeAll();

      // Добавление стартовой точки
      const startPlacemark = new window.ymaps.Placemark(
        [startPoint.latitude, startPoint.longitude],
        {
          balloonContentBody: `
            <div class="p-2">
              <h3 class="font-bold">Точка отправления</h3>
            </div>
          `,
          hintContent: "Начало маршрута",
        },
        {
          preset: "islands#greenCircleDotIcon",
        }
      );
      mapInstanceRef.current.geoObjects.add(startPlacemark);

      // Добавление точек заказов
      orders.forEach((order, index) => {
        if (order.latitude && order.longitude) {
          const placemark = new window.ymaps.Placemark(
            [order.latitude, order.longitude],
            {
              balloonContentBody: `
                <div class="p-2">
                  <h3 class="font-bold">Заказ #${order.id.slice(0, 8)}</h3>
                  <p class="text-sm">${order.address || "Адрес не указан"}</p>
                  <p class="text-sm">Порядок: ${index + 1}</p>
                </div>
              `,
              hintContent: `Заказ #${order.id.slice(0, 8)}`,
            },
            {
              preset: "islands#blueIcon",
              iconCaption: `${index + 1}`,
            }
          );
          mapInstanceRef.current.geoObjects.add(placemark);
        }
      });

      // Построение маршрута, если есть точки
      if (orders.length > 0 && orders.some((o) => o.latitude && o.longitude)) {
        calculateOptimalRoute();
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [startPoint, orders]);

  const calculateOptimalRoute = async () => {
    setLoading(true);
    try {
      const points = orders
        .filter((o) => o.latitude && o.longitude)
        .map((o) => ({
          latitude: o.latitude!,
          longitude: o.longitude!,
        }));

      const optimalRoute = await geolocationAPI.createRoute(startPoint, points);
      setRoute(optimalRoute);

      if (onRouteCalculated) {
        onRouteCalculated(optimalRoute);
      }

      // Построение маршрута на карте
      if (window.ymaps && optimalRoute.length > 1) {
        // Удаляем предыдущий маршрут
        if (multiRouteRef.current) {
          mapInstanceRef.current.geoObjects.remove(multiRouteRef.current);
        }

        // Создаем точки для маршрута
        const waypoints = optimalRoute.slice(1, -1).map((point: { latitude: number; longitude: number }) => [
          point.latitude,
          point.longitude,
        ]);

        multiRouteRef.current = new window.ymaps.multiRouter.MultiRoute(
          {
            referencePoints: [
            [startPoint.latitude, startPoint.longitude],
            ...waypoints,
            [
              optimalRoute[optimalRoute.length - 1].latitude,
              optimalRoute[optimalRoute.length - 1].longitude,
            ],
          ],
            params: {
              routingMode: "auto",
            },
          },
          {
            boundsAutoApply: true,
          }
        );

        mapInstanceRef.current.geoObjects.add(multiRouteRef.current);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />
      {loading && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow-lg">
          <p className="text-sm">Построение маршрута...</p>
        </div>
      )}
      {route.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
          <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">
            Оптимальный маршрут
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Точек на маршруте: {route.length}
          </p>
        </div>
      )}
    </div>
  );
}

