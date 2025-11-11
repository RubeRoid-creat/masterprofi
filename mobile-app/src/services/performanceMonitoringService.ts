/**
 * Performance Monitoring Service
 * Tracks app performance metrics
 */

import { analyticsService } from './analyticsService';
import { crashReportingService } from './crashReportingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  apiResponseTime: { [endpoint: string]: number[] };
  screenRenderTime: { [screen: string]: number[] };
  componentRenderTime: { [component: string]: number[] };
  memoryUsage: number[];
  appStartTime?: number;
  bundleSize?: number;
}

export interface PerformanceThreshold {
  apiResponseTime: number; // ms
  screenRenderTime: number; // ms
  memoryUsage: number; // MB
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetrics = {
    apiResponseTime: {},
    screenRenderTime: {},
    componentRenderTime: {},
    memoryUsage: [],
  };

  private thresholds: PerformanceThreshold = {
    apiResponseTime: 2000, // 2 seconds
    screenRenderTime: 1000, // 1 second
    memoryUsage: 500, // 500 MB
  };

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    this.trackAppStart();
    this.loadMetrics();
    
    // Setup periodic memory checks
    this.setupMemoryMonitoring();
  }

  /**
   * Track API response time
   */
  trackApiResponse(endpoint: string, responseTime: number, success: boolean = true): void {
    if (!this.metrics.apiResponseTime[endpoint]) {
      this.metrics.apiResponseTime[endpoint] = [];
    }

    this.metrics.apiResponseTime[endpoint].push(responseTime);
    
    // Keep only last 100 measurements per endpoint
    if (this.metrics.apiResponseTime[endpoint].length > 100) {
      this.metrics.apiResponseTime[endpoint] = this.metrics.apiResponseTime[endpoint].slice(-100);
    }

    // Track slow API calls
    if (responseTime > this.thresholds.apiResponseTime) {
      analyticsService.track('slow_api_call', {
        endpoint,
        responseTime,
        threshold: this.thresholds.apiResponseTime,
      });

      crashReportingService.captureMessage(
        `Slow API call: ${endpoint} (${responseTime}ms)`,
        'warning',
        {
          extra: { endpoint, responseTime },
        }
      );
    }

    analyticsService.trackPerformance('api_response', responseTime, 'ms', {
      endpoint,
      success,
    });

    this.saveMetrics();
  }

  /**
   * Track screen render time
   */
  trackScreenRender(screenName: string, renderTime: number): void {
    if (!this.metrics.screenRenderTime[screenName]) {
      this.metrics.screenRenderTime[screenName] = [];
    }

    this.metrics.screenRenderTime[screenName].push(renderTime);
    
    if (this.metrics.screenRenderTime[screenName].length > 50) {
      this.metrics.screenRenderTime[screenName] = 
        this.metrics.screenRenderTime[screenName].slice(-50);
    }

    if (renderTime > this.thresholds.screenRenderTime) {
      analyticsService.track('slow_screen_render', {
        screen: screenName,
        renderTime,
        threshold: this.thresholds.screenRenderTime,
      });
    }

    analyticsService.trackPerformance('screen_render', renderTime, 'ms', {
      screen: screenName,
    });

    this.saveMetrics();
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    if (!this.metrics.componentRenderTime[componentName]) {
      this.metrics.componentRenderTime[componentName] = [];
    }

    this.metrics.componentRenderTime[componentName].push(renderTime);
    
    if (this.metrics.componentRenderTime[componentName].length > 100) {
      this.metrics.componentRenderTime[componentName] = 
        this.metrics.componentRenderTime[componentName].slice(-100);
    }

    this.saveMetrics();
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(memoryMB: number): void {
    this.metrics.memoryUsage.push(memoryMB);
    
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
    }

    if (memoryMB > this.thresholds.memoryUsage) {
      analyticsService.track('high_memory_usage', {
        memoryMB,
        threshold: this.thresholds.memoryUsage,
      });

      crashReportingService.captureMessage(
        `High memory usage: ${memoryMB}MB`,
        'warning',
        {
          extra: { memoryMB },
        }
      );
    }

    this.saveMetrics();
  }

  /**
   * Track app start time
   */
  private trackAppStart(): void {
    const startTime = Date.now();
    this.metrics.appStartTime = startTime;

    // Track when app becomes interactive
    setTimeout(() => {
      const loadTime = Date.now() - startTime;
      analyticsService.trackPerformance('app_start', loadTime, 'ms');
      this.metrics.appStartTime = loadTime;
      this.saveMetrics();
    }, 100);
  }

  /**
   * Get average performance metrics
   */
  getAverageMetrics(): {
    averageApiResponseTime: { [endpoint: string]: number };
    averageScreenRenderTime: { [screen: string]: number };
    averageComponentRenderTime: { [component: string]: number };
    averageMemoryUsage: number;
  } {
    const averageApiResponseTime: { [endpoint: string]: number } = {};
    Object.keys(this.metrics.apiResponseTime).forEach(endpoint => {
      const times = this.metrics.apiResponseTime[endpoint];
      averageApiResponseTime[endpoint] = times.reduce((sum, t) => sum + t, 0) / times.length;
    });

    const averageScreenRenderTime: { [screen: string]: number } = {};
    Object.keys(this.metrics.screenRenderTime).forEach(screen => {
      const times = this.metrics.screenRenderTime[screen];
      averageScreenRenderTime[screen] = times.reduce((sum, t) => sum + t, 0) / times.length;
    });

    const averageComponentRenderTime: { [component: string]: number } = {};
    Object.keys(this.metrics.componentRenderTime).forEach(component => {
      const times = this.metrics.componentRenderTime[component];
      averageComponentRenderTime[component] = times.reduce((sum, t) => sum + t, 0) / times.length;
    });

    const averageMemoryUsage = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage.reduce((sum, m) => sum + m, 0) / this.metrics.memoryUsage.length
      : 0;

    return {
      averageApiResponseTime,
      averageScreenRenderTime,
      averageComponentRenderTime,
      averageMemoryUsage,
    };
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    // Check memory every 30 seconds
    setInterval(() => {
      // In React Native, you would use a native module or estimate
      // For now, this is a placeholder
      // const memory = getMemoryUsage(); // Implement native module
      // this.trackMemoryUsage(memory);
    }, 30000);
  }

  /**
   * Save metrics
   */
  private async saveMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem('performance_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  /**
   * Load metrics
   */
  private async loadMetrics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('performance_metrics');
      if (data) {
        this.metrics = { ...this.metrics, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }

  /**
   * Update thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThreshold>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Clear metrics
   */
  async clearMetrics(): Promise<void> {
    this.metrics = {
      apiResponseTime: {},
      screenRenderTime: {},
      componentRenderTime: {},
      memoryUsage: [],
    };
    await AsyncStorage.removeItem('performance_metrics');
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();

