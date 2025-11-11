import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CommonIssue } from '../../types/knowledgeBase';

interface CommonIssuesProps {
  issues: CommonIssue[];
  onIssuePress?: (issue: CommonIssue) => void;
  selectedApplianceType?: string;
}

export const CommonIssues: React.FC<CommonIssuesProps> = ({
  issues,
  onIssuePress,
  selectedApplianceType,
}) => {
  const filteredIssues = selectedApplianceType
    ? issues.filter((issue) => issue.applianceType === selectedApplianceType)
    : issues;

  const sortedIssues = [...filteredIssues].sort((a, b) => b.frequency - a.frequency);

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 70) return 'bg-red-100 text-red-800';
    if (frequency >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Common Issues</Text>
        {selectedApplianceType && (
          <Text className="text-sm text-gray-500">Filtered: {selectedApplianceType}</Text>
        )}
      </View>

      {sortedIssues.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-gray-500">No common issues found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {sortedIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              onPress={() => onIssuePress?.(issue)}
              className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {issue.issue}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">{issue.description}</Text>
                </View>
                <View className={`px-2 py-1 rounded ${getFrequencyColor(issue.frequency)}`}>
                  <Text className="text-xs font-medium">{issue.frequency}%</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-2">
                <Text className="text-xs text-gray-500 mr-2">
                  {issue.applianceType}
                </Text>
              </View>

              {issue.quickFix && (
                <View className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <Text className="text-xs font-semibold text-green-800 mb-1">
                    Quick Fix:
                  </Text>
                  <Text className="text-xs text-green-900">{issue.quickFix}</Text>
                </View>
              )}

              <TouchableOpacity className="mt-3 self-start">
                <Text className="text-blue-600 text-sm font-medium">
                  View Solutions ({issue.solutions.length})
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};








