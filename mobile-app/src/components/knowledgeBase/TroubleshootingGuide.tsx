import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TroubleshootingGuide } from '../../types/knowledgeBase';

interface TroubleshootingGuideProps {
  guide: TroubleshootingGuide;
  onSolutionSelect?: (solutionId: string) => void;
}

export const TroubleshootingGuideComponent: React.FC<TroubleshootingGuideProps> = ({
  guide,
  onSolutionSelect,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (step: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-2">{guide.issue}</Text>
        <Text className="text-sm text-gray-600 mb-3">{guide.applianceType}</Text>

        {/* Symptoms */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Symptoms</Text>
          <View className="flex-row flex-wrap gap-2">
            {guide.symptoms.map((symptom, index) => (
              <View key={index} className="bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <Text className="text-xs text-red-800">{symptom}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Solutions */}
      <View>
        <Text className="text-base font-semibold text-gray-900 mb-3">Solutions</Text>
        {guide.solutions.map((solution) => {
          const isExpanded = expandedSteps.has(solution.step);

          return (
            <View
              key={solution.step}
              className="mb-3 border border-gray-200 rounded-lg overflow-hidden"
            >
              <TouchableOpacity
                onPress={() => toggleStep(solution.step)}
                className="flex-row items-center justify-between p-4 bg-gray-50"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-sm">{solution.step}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {solution.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className={`px-2 py-0.5 rounded ${getDifficultyColor(solution.difficulty)}`}>
                        <Text className="text-xs font-medium capitalize">
                          {solution.difficulty}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        ⏱️ {formatTime(solution.estimatedTime)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-gray-400 text-lg ml-2">
                  {isExpanded ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <View className="p-4 bg-white">
                  <Text className="text-sm text-gray-700 mb-3 leading-5">
                    {solution.description}
                  </Text>

                  {solution.parts && solution.parts.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-xs font-semibold text-gray-900 mb-1">
                        Required Parts
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {solution.parts.map((part, index) => (
                          <View key={index} className="bg-blue-50 px-2 py-1 rounded">
                            <Text className="text-xs text-blue-800">{part}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {solution.tools && solution.tools.length > 0 && (
                    <View>
                      <Text className="text-xs font-semibold text-gray-900 mb-1">
                        Required Tools
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {solution.tools.map((tool, index) => (
                          <View key={index} className="bg-gray-100 px-2 py-1 rounded">
                            <Text className="text-xs text-gray-700">{tool}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {onSolutionSelect && (
                    <TouchableOpacity
                      onPress={() => onSolutionSelect(`${guide.id}-${solution.step}`)}
                      className="bg-blue-600 py-2 px-4 rounded-lg mt-3 self-start"
                    >
                      <Text className="text-white font-semibold text-sm">Try This Solution</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};








