import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { MLMMember } from '../../types/mlm';
import { getFirstChar } from '../../utils/stringHelpers';

interface MLMTreeNodeProps {
  member: MLMMember;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
  onPress?: (member: MLMMember) => void;
  onContact?: (member: MLMMember, type: 'call' | 'message') => void;
  showChildren?: boolean;
  childrenCount?: number;
}

export const MLMTreeNode: React.FC<MLMTreeNodeProps> = ({
  member,
  depth,
  isExpanded,
  onToggle,
  onPress,
  onContact,
  showChildren = true,
  childrenCount,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'bronze':
        return { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' };
      case 'silver':
        return { bg: 'bg-gray-400', text: 'text-white', border: 'border-gray-500' };
      case 'gold':
        return { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600' };
      case 'platinum':
        return { bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-500' };
      case 'diamond':
        return { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' };
      default:
        return { bg: 'bg-gray-300', text: 'text-gray-800', border: 'border-gray-400' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getPerformanceIndicator = (sales: number, teamSales: number) => {
    const ratio = teamSales > 0 ? (sales / teamSales) * 100 : 0;
    
    if (ratio >= 50) {
      return { color: 'bg-green-500', label: 'Excellent' };
    } else if (ratio >= 30) {
      return { color: 'bg-blue-500', label: 'Good' };
    } else if (ratio >= 15) {
      return { color: 'bg-yellow-500', label: 'Average' };
    } else {
      return { color: 'bg-red-500', label: 'Low' };
    }
  };

  const rankColors = getRankColor(member.rank);
  const performance = getPerformanceIndicator(member.personalSales, member.teamSales);
  const hasChildren = showChildren && (member.children && member.children.length > 0 || childrenCount !== undefined && childrenCount > 0);
  const displayChildrenCount = childrenCount !== undefined ? childrenCount : member.totalDownline;

  const handleCall = () => {
    if (onContact) {
      onContact(member, 'call');
    } else {
      Linking.openURL(`tel:${member.phone}`);
    }
  };

  const handleMessage = () => {
    if (onContact) {
      onContact(member, 'message');
    } else {
      Linking.openURL(`sms:${member.phone}`);
    }
  };

  return (
    <View
      style={{ marginLeft: depth * 16 }}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${member.rank}, Level ${member.level}, Team size ${displayChildrenCount}`}
      accessibilityHint="Double tap to view member details"
    >
      <View className="bg-white rounded-lg border border-gray-200 mb-2 shadow-sm">
        {/* Main Content */}
        <TouchableOpacity
          onPress={() => onPress?.(member)}
          activeOpacity={0.7}
          className="p-4"
        >
          {/* Header Row */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-center flex-1">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="w-8 h-8 items-center justify-center mr-2"
                  accessibilityRole="button"
                  accessibilityLabel={isExpanded ? 'Collapse' : 'Expand'}
                  accessibilityHint={`${isExpanded ? 'Collapse' : 'Expand'} to ${isExpanded ? 'hide' : 'show'} team members`}
                >
                  <Text className="text-gray-600 text-lg font-bold">
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
              )}
              {!hasChildren && <View className="w-8 h-8 mr-2" />}

              {/* Avatar */}
              <TouchableOpacity
                onPress={() => onPress?.(member)}
                className="mr-3"
              >
                {member.avatar ? (
                  <Image
                    source={{ uri: member.avatar }}
                    className="w-14 h-14 rounded-full border-2"
                    style={{ borderColor: rankColors.border }}
                    accessibilityLabel={`${member.name} avatar`}
                  />
                ) : (
                  <View
                    className="w-14 h-14 rounded-full border-2 items-center justify-center"
                    style={{ backgroundColor: rankColors.bg, borderColor: rankColors.border }}
                    accessibilityLabel={`${member.name} avatar placeholder`}
                  >
                    <Text className={`text-xl font-bold ${rankColors.text}`}>
                      {getFirstChar(member.name)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Member Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text
                    className="text-base font-bold text-gray-900 mr-2"
                    numberOfLines={1}
                    accessibilityLabel={`Member name: ${member.name}`}
                  >
                    {member.name}
                  </Text>
                  <View
                    className={`px-2 py-0.5 rounded-full ${rankColors.bg} ${rankColors.border} border`}
                    accessibilityLabel={`Rank: ${member.rank}`}
                  >
                    <Text className={`text-xs font-semibold ${rankColors.text}`}>
                      {member.rank}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 mb-2">
                  <View className="bg-blue-50 px-2 py-0.5 rounded">
                    <Text className="text-xs font-medium text-blue-800">
                      L{member.level}
                    </Text>
                  </View>
                  <View
                    className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}
                    accessibilityLabel={`Status: ${member.status}`}
                  />
                  <Text className="text-xs text-gray-500 capitalize">
                    {member.status}
                  </Text>
                </View>

                {/* Performance Indicator */}
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-1 ${performance.color}`} />
                  <Text className="text-xs text-gray-600">
                    {performance.label} Performance
                  </Text>
                </View>
              </View>
            </View>

            {/* Monthly Earnings */}
            <View className="items-end ml-2">
              <Text
                className="text-lg font-bold text-green-600"
                accessibilityLabel={`Monthly earnings: ${formatCurrency(member.monthlyEarnings)}`}
              >
                {formatCurrency(member.monthlyEarnings)}
              </Text>
              <Text className="text-xs text-gray-500">monthly</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            <View className="flex-row items-center gap-4">
              {/* Team Size */}
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-1">👥</Text>
                <View>
                  <Text
                    className="text-sm font-semibold text-gray-900"
                    accessibilityLabel={`Team size: ${displayChildrenCount} members`}
                  >
                    {displayChildrenCount}
                  </Text>
                  <Text className="text-xs text-gray-500">team</Text>
                </View>
              </View>

              {/* Direct Referrals */}
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-1">➕</Text>
                <View>
                  <Text
                    className="text-sm font-semibold text-gray-900"
                    accessibilityLabel={`Direct referrals: ${member.directReferrals}`}
                  >
                    {member.directReferrals}
                  </Text>
                  <Text className="text-xs text-gray-500">direct</Text>
                </View>
              </View>

              {/* Sales */}
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-1">💰</Text>
                <View>
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatCurrency(member.teamSales).replace('₽', '')}
                  </Text>
                  <Text className="text-xs text-gray-500">sales</Text>
                </View>
              </View>
            </View>

            {/* Recruitment Status */}
            {member.status === 'active' && member.directReferrals > 0 && (
              <View className="bg-green-50 px-2 py-1 rounded border border-green-200">
                <Text className="text-xs font-medium text-green-800">
                  Recruiting
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-gray-500">
              Joined: {new Date(member.joinDate).toLocaleDateString('ru-RU', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleCall();
              }}
              className="bg-green-600 px-3 py-1.5 rounded-lg"
              accessibilityRole="button"
              accessibilityLabel={`Call ${member.name}`}
              accessibilityHint="Tap to call this member"
            >
              <Text className="text-white text-xs font-medium">📞</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleMessage();
              }}
              className="bg-blue-600 px-3 py-1.5 rounded-lg"
              accessibilityRole="button"
              accessibilityLabel={`Message ${member.name}`}
              accessibilityHint="Tap to send message to this member"
            >
              <Text className="text-white text-xs font-medium">💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

