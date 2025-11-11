/**
 * Analytics Dashboard Component
 * Developer/admin view of analytics data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { userEngagementService, EngagementMetrics } from '../../services/userEngagementService';
import { orderAnalyticsService, OrderMetrics } from '../../services/orderAnalyticsService';
import { featureUsageService, FeatureUsageStats } from '../../services/featureUsageService';
import { performanceMonitoringService } from '../../services/performanceMonitoringService';
import { userFlowService, FlowAnalysis } from '../../services/userFlowService';
import { config } from '../../config/environments';

export const AnalyticsDashboard: React.FC = () => {
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics | null>(null);
  const [featureStats, setFeatureStats] = useState<FeatureUsageStats[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [flowAnalysis, setFlowAnalysis] = useState<FlowAnalysis[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setRefreshing(true);
    try {
      const [engagement, orders, features, performance, flows] = await Promise.all([
        userEngagementService.getMetrics(),
        orderAnalyticsService.getMetrics('all'),
        featureUsageService.getFeatureStats(),
        Promise.resolve(performanceMonitoringService.getAverageMetrics()),
        Promise.all([
          userFlowService.analyzeFlow('order_flow'),
          userFlowService.analyzeFlow('registration_flow'),
          userFlowService.analyzeFlow('payment_flow'),
        ]),
      ]);

      setEngagementMetrics(engagement);
      setOrderMetrics(orders);
      setFeatureStats(Array.isArray(features) ? features : []);
      setPerformanceMetrics(performance);
      setFlowAnalysis(flows.filter((f): f is FlowAnalysis => f !== null));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Only show in development/staging
  if (config.environment === 'production') {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadMetrics} />}
    >
      <Text style={styles.title}>Analytics Dashboard</Text>

      {engagementMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Engagement</Text>
          <Text>Session Duration: {(engagementMetrics.sessionDuration / 1000).toFixed(1)}s</Text>
          <Text>Screen Views: {engagementMetrics.screenViews}</Text>
          <Text>Interactions: {engagementMetrics.interactions}</Text>
          <Text>Active Days: {engagementMetrics.activeDays}</Text>
        </View>
      )}

      {orderMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Metrics</Text>
          <Text>Total Orders: {orderMetrics.totalOrders}</Text>
          <Text>Completed: {orderMetrics.completedOrders}</Text>
          <Text>Completion Rate: {orderMetrics.completionRate.toFixed(1)}%</Text>
          <Text>Average Completion Time: {(orderMetrics.averageCompletionTime / 1000).toFixed(1)}s</Text>
          <Text>Revenue: ₽{orderMetrics.revenue.toFixed(2)}</Text>
        </View>
      )}

      {featureStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Usage</Text>
          {featureStats.slice(0, 10).map((stat) => (
            <Text key={stat.feature}>
              {stat.feature}: {stat.usageCount} uses
            </Text>
          ))}
        </View>
      )}

      {performanceMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <Text>Average Memory: {performanceMetrics.averageMemoryUsage.toFixed(2)} MB</Text>
          <Text>App Start Time: {performanceMetrics.averageScreenRenderTime?.App?.toFixed(0) || 'N/A'}ms</Text>
        </View>
      )}

      {flowAnalysis.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flow Analysis</Text>
          {flowAnalysis.map((flow) => (
            <View key={flow.flowName} style={styles.flowItem}>
              <Text style={styles.flowName}>{flow.flowName}</Text>
              <Text>Starts: {flow.totalStarts}</Text>
              <Text>Completions: {flow.totalCompletions}</Text>
              <Text>Completion Rate: {flow.completionRate.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={loadMetrics}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  flowItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  flowName: {
    fontWeight: '600',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});








