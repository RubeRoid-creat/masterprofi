import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { reviewsAPI } from "../services/api";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  order?: {
    id: string;
    description?: string;
  };
}

interface ReviewsListProps {
  masterId?: string;
  orderId?: string;
  limit?: number;
  showOrderInfo?: boolean;
}

export default function ReviewsList({
  masterId,
  orderId,
  limit,
  showOrderInfo = false,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReviews();
  }, [masterId, orderId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsAPI.getAll(masterId, orderId);
      const sortedReviews = Array.isArray(data)
        ? data
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, limit || data.length)
        : [];
      setReviews(sortedReviews);
      setError("");
    } catch (err: any) {
      console.error("Error loading reviews:", err);
      setError("Ошибка загрузки отзывов");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (review: Review) => {
    if (review.client?.firstName && review.client?.lastName) {
      return `${review.client.firstName} ${review.client.lastName}`;
    }
    return review.client?.email || "Анонимный клиент";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Загрузка отзывов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Отзывов пока нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getClientName(review)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {showOrderInfo && review.order && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Заказ: {review.order.description || review.order.id}
                </p>
              )}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

