import { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => void;
  onCancel?: () => void;
  initialData?: { rating?: number; comment?: string };
  loading?: boolean;
}

export default function ReviewForm({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 0);
      setComment(initialData.comment || "");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Пожалуйста, выберите рейтинг");
      return;
    }

    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Оценка *
        </label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Оставьте отзыв о работе мастера..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Отправка..." : "Отправить отзыв"}
        </button>
      </div>
    </form>
  );
}

