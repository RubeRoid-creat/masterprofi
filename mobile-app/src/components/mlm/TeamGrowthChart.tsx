import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Svg, Line, Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { TeamGrowth } from '../../types/mlm';

interface TeamGrowthChartProps {
  data: TeamGrowth[];
  type: 'members' | 'sales';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 200;
const PADDING = 20;

export const TeamGrowthChart: React.FC<TeamGrowthChartProps> = ({ data, type }) => {
  if (data.length === 0) {
    return (
      <View className="bg-white rounded-lg p-4 mb-4 items-center justify-center h-48">
        <Text className="text-gray-500">No data available</Text>
      </View>
    );
  }

  const values = data.map((d) => (type === 'members' ? d.members : d.sales));
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);

  const chartWidth = CHART_WIDTH - PADDING * 2;
  const chartHeight = CHART_HEIGHT - PADDING * 2;

  const getX = (index: number) => {
    return PADDING + (index / (data.length - 1 || 1)) * chartWidth;
  };

  const getY = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return PADDING + chartHeight - ratio * chartHeight;
  };

  // Generate path for line
  const pathData = data
    .map((d, index) => {
      const value = type === 'members' ? d.members : d.sales;
      const x = getX(index);
      const y = getY(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (data[0]?.period === 'day') {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    }
    return date.toLocaleDateString('ru-RU', { month: 'short' });
  };

  const formatValue = (value: number) => {
    if (type === 'sales') {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          Team Growth - {type === 'members' ? 'Members' : 'Sales'}
        </Text>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = PADDING + chartHeight - ratio * chartHeight;
          const value = minValue + ratio * (maxValue - minValue);
          return (
            <G key={ratio}>
              <Line
                x1={PADDING}
                y1={y}
                x2={PADDING + chartWidth}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <SvgText
                x={PADDING - 5}
                y={y + 4}
                fontSize="10"
                fill="#6B7280"
                textAnchor="end"
              >
                {formatValue(value).replace('₽', '')}
              </SvgText>
            </G>
          );
        })}

        {/* Line Path */}
        <Path
          d={pathData}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
        />

        {/* Area under line */}
        <Path
          d={`${pathData} L ${getX(data.length - 1)} ${PADDING + chartHeight} L ${PADDING} ${PADDING + chartHeight} Z`}
          fill="#3B82F6"
          fillOpacity="0.1"
        />

        {/* Data Points */}
        {data.map((d, index) => {
          const value = type === 'members' ? d.members : d.sales;
          const x = getX(index);
          const y = getY(value);
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3B82F6"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, index) => {
          const x = getX(index);
          if (index % Math.ceil(data.length / 5) === 0 || index === data.length - 1) {
            return (
              <SvgText
                key={index}
                x={x}
                y={CHART_HEIGHT - 5}
                fontSize="10"
                fill="#6B7280"
                textAnchor="middle"
              >
                {formatDate(d.date)}
              </SvgText>
            );
          }
          return null;
        })}
      </Svg>

      {/* Summary */}
      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <View>
          <Text className="text-xs text-gray-500">Current</Text>
          <Text className="text-base font-semibold text-gray-900">
            {formatValue(values[values.length - 1])}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500">Growth</Text>
          <Text className="text-base font-semibold text-green-600">
            {values.length > 1
              ? `+${((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)}%`
              : '0%'}
          </Text>
        </View>
      </View>
    </View>
  );
};









