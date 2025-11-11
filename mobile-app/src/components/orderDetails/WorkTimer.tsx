import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WorkTimer as WorkTimerType } from '../../types/orderDetails';

interface WorkTimerProps {
  timer: WorkTimerType;
  onStart: () => void;
  onStop: () => void;
  onResume?: () => void;
  onPause?: () => void;
}

export const WorkTimer: React.FC<WorkTimerProps> = ({
  timer,
  onStart,
  onStop,
  onResume,
  onPause,
}) => {
  const [displayTime, setDisplayTime] = useState(timer.elapsedTime);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.isRunning) {
      interval = setInterval(() => {
        setDisplayTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalTime = (): number => {
    const breakTime = timer.breaks.reduce((sum, b) => {
      if (b.endTime && b.duration) {
        return sum + b.duration;
      }
      return sum;
    }, 0);
    return displayTime - breakTime;
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Work Timer</Text>

      {/* Timer Display */}
      <View className="items-center mb-6">
        <View className="bg-gray-50 rounded-lg p-6 mb-4">
          <Text className="text-4xl font-bold text-gray-900 text-center">
            {formatTime(timer.isRunning ? displayTime : timer.elapsedTime)}
          </Text>
          {timer.isRunning && (
            <View className="flex-row items-center justify-center mt-2">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              <Text className="text-sm text-green-600 font-medium">Running</Text>
            </View>
          )}
        </View>

        {/* Total Work Time (excluding breaks) */}
        <Text className="text-sm text-gray-600">
          Work Time: {formatTime(calculateTotalTime())}
        </Text>
        {timer.breaks.length > 0 && (
          <Text className="text-xs text-gray-500 mt-1">
            Breaks: {timer.breaks.length} ({formatTime(
              timer.breaks.reduce((sum, b) => sum + (b.duration || 0), 0)
            )})
          </Text>
        )}
      </View>

      {/* Control Buttons */}
      <View className="flex-row gap-3">
        {!timer.isRunning && timer.elapsedTime === 0 ? (
          <TouchableOpacity
            onPress={onStart}
            className="flex-1 py-4 bg-green-600 rounded-lg items-center"
          >
            <Text className="text-white font-semibold text-base">Start Work</Text>
          </TouchableOpacity>
        ) : timer.isRunning ? (
          <>
            {onPause && (
              <TouchableOpacity
                onPress={onPause}
                className="flex-1 py-4 bg-yellow-600 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-base">Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onStop}
              className="flex-1 py-4 bg-red-600 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {onResume && (
              <TouchableOpacity
                onPress={onResume}
                className="flex-1 py-4 bg-green-600 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-base">Resume</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onStop}
              className="flex-1 py-4 bg-red-600 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">Finish Work</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};









