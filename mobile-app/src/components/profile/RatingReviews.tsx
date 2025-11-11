import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Rating, Review } from '../../types/profile';
import { getFirstChar } from '../../utils/stringHelpers';

interface RatingReviewsProps {
  rating: Rating;
  reviews: Review[];
  onReviewPress?: (review: Review) => void;
}

export const RatingReviews: React.FC<RatingReviewsProps> = ({
  rating,
  reviews,
  onReviewPress,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (count: number, filled: boolean) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Text key={i} className="text-lg">
        {i < count ? (filled ? '⭐' : '☆') : '☆'}
      </Text>
    ));
  };

  const percentage = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Rating & Reviews</Text>

      {/* Overall Rating */}
      <View className="items-center mb-6 pb-6 border-b border-gray-200">
        <View className="flex-row items-center mb-2">
          <Text className="text-5xl font-bold text-gray-900 mr-3">{rating.average.toFixed(1)}</Text>
          <View>
            <View className="flex-row">{renderStars(Math.round(rating.average), true)}</View>
            <Text className="text-sm text-gray-500 mt-1">{rating.total} reviews</Text>
          </View>
        </View>
      </View>

      {/* Rating Breakdown */}
      <View className="mb-6">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = rating.breakdown[stars as keyof typeof rating.breakdown];
          const percent = percentage(count, rating.total);

          return (
            <View key={stars} className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-600 w-8">{stars} ⭐</Text>
              <View className="flex-1 h-2 bg-gray-200 rounded-full mx-3 overflow-hidden">
                <View
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </View>
              <Text className="text-sm text-gray-600 w-12 text-right">{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Reviews List */}
      <View>
        <Text className="text-base font-semibold text-gray-900 mb-3">
          Recent Reviews ({reviews.length})
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {reviews.slice(0, 5).map((review) => (
            <TouchableOpacity
              key={review.id}
              onPress={() => onReviewPress?.(review)}
              className="mb-4 pb-4 border-b border-gray-100 last:border-0"
            >
              <View className="flex-row items-start mb-2">
                {review.clientAvatar ? (
                  <Image
                    source={{ uri: review.clientAvatar }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                    <Text className="text-white font-semibold">
                      {getFirstChar(review.clientName)}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {review.clientName}
                    </Text>
                    <Text className="text-sm text-gray-500">{formatDate(review.createdAt)}</Text>
                  </View>
                  <View className="flex-row mb-2">
                    {renderStars(review.rating, true)}
                  </View>
                  <Text className="text-sm text-gray-700 mb-2">{review.comment}</Text>
                  {review.response && (
                    <View className="bg-gray-50 rounded-lg p-3 mt-2">
                      <Text className="text-xs font-semibold text-gray-600 mb-1">Your Response</Text>
                      <Text className="text-sm text-gray-700">{review.response}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

