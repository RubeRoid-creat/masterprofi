/**
 * Order Analytics Service
 * Tracks order completion rates and order-related metrics
 */

import { analyticsService } from './analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageCompletionTime: number;
  completionRate: number;
  ordersByStatus: { [status: string]: number };
  ordersByCategory: { [category: string]: number };
  revenue: number;
  averageOrderValue: number;
}

class OrderAnalyticsService {
  private orderEvents: Array<{
    orderId: string;
    status: string;
    timestamp: number;
    category?: string;
    value?: number;
    completionTime?: number;
  }> = [];

  /**
   * Initialize order analytics
   */
  initialize(): void {
    this.loadOrderEvents();
  }

  /**
   * Track order created
   */
  trackOrderCreated(orderId: string, category?: string, value?: number): void {
    this.orderEvents.push({
      orderId,
      status: 'created',
      timestamp: Date.now(),
      category,
      value,
    });

    analyticsService.track('order_created', {
      orderId,
      category,
      value,
      timestamp: new Date().toISOString(),
    });

    this.saveOrderEvents();
  }

  /**
   * Track order accepted
   */
  trackOrderAccepted(orderId: string): void {
    this.updateOrderEvent(orderId, 'accepted');

    analyticsService.track('order_accepted', {
      orderId,
      timestamp: new Date().toISOString(),
    });

    this.saveOrderEvents();
  }

  /**
   * Track order started
   */
  trackOrderStarted(orderId: string): void {
    this.updateOrderEvent(orderId, 'in_progress');

    analyticsService.track('order_started', {
      orderId,
      timestamp: new Date().toISOString(),
    });

    this.saveOrderEvents();
  }

  /**
   * Track order completed
   */
  trackOrderCompleted(orderId: string, completionTime?: number): void {
    const event = this.updateOrderEvent(orderId, 'completed');
    if (event && completionTime) {
      event.completionTime = completionTime;
    }

    analyticsService.track('order_completed', {
      orderId,
      completionTime,
      timestamp: new Date().toISOString(),
    });

    this.saveOrderEvents();
  }

  /**
   * Track order cancelled
   */
  trackOrderCancelled(orderId: string, reason?: string): void {
    this.updateOrderEvent(orderId, 'cancelled');

    analyticsService.track('order_cancelled', {
      orderId,
      reason,
      timestamp: new Date().toISOString(),
    });

    this.saveOrderEvents();
  }

  /**
   * Track order status change
   */
  trackOrderStatusChange(orderId: string, oldStatus: string, newStatus: string): void {
    analyticsService.track('order_status_changed', {
      orderId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString(),
    });

    this.updateOrderEvent(orderId, newStatus);
    this.saveOrderEvents();
  }

  /**
   * Get order completion rate
   */
  async getCompletionRate(timeframe?: 'day' | 'week' | 'month' | 'all'): Promise<number> {
    const metrics = await this.getMetrics(timeframe);
    return metrics.completionRate;
  }

  /**
   * Get order metrics
   */
  async getMetrics(timeframe?: 'day' | 'week' | 'month' | 'all'): Promise<OrderMetrics> {
    const filteredEvents = this.filterEventsByTimeframe(timeframe);
    
    const totalOrders = filteredEvents.filter(e => e.status === 'created').length;
    const completedOrders = filteredEvents.filter(e => e.status === 'completed').length;
    const cancelledOrders = filteredEvents.filter(e => e.status === 'cancelled').length;
    
    const completionTimes = filteredEvents
      .filter(e => e.status === 'completed' && e.completionTime)
      .map(e => e.completionTime!);
    
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    const completionRate = totalOrders > 0
      ? (completedOrders / totalOrders) * 100
      : 0;

    // Calculate orders by status
    const ordersByStatus: { [status: string]: number } = {};
    filteredEvents.forEach(event => {
      ordersByStatus[event.status] = (ordersByStatus[event.status] || 0) + 1;
    });

    // Calculate orders by category
    const ordersByCategory: { [category: string]: number } = {};
    filteredEvents.forEach(event => {
      if (event.category) {
        ordersByCategory[event.category] = (ordersByCategory[event.category] || 0) + 1;
      }
    });

    // Calculate revenue
    const revenue = filteredEvents
      .filter(e => e.status === 'completed' && e.value)
      .reduce((sum, e) => sum + (e.value || 0), 0);

    const averageOrderValue = completedOrders > 0
      ? revenue / completedOrders
      : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      averageCompletionTime,
      completionRate,
      ordersByStatus,
      ordersByCategory,
      revenue,
      averageOrderValue,
    };
  }

  /**
   * Filter events by timeframe
   */
  private filterEventsByTimeframe(timeframe?: 'day' | 'week' | 'month' | 'all'): typeof this.orderEvents {
    if (!timeframe || timeframe === 'all') {
      return this.orderEvents;
    }

    const now = Date.now();
    let cutoffTime: number;

    switch (timeframe) {
      case 'day':
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        return this.orderEvents;
    }

    return this.orderEvents.filter(event => event.timestamp >= cutoffTime);
  }

  /**
   * Update order event
   */
  private updateOrderEvent(orderId: string, status: string): typeof this.orderEvents[0] | undefined {
    const event = this.orderEvents.find(e => e.orderId === orderId);
    if (event) {
      event.status = status;
      event.timestamp = Date.now();
    }
    return event;
  }

  /**
   * Save order events
   */
  private async saveOrderEvents(): Promise<void> {
    try {
      // Keep only last 1000 events
      const eventsToSave = this.orderEvents.slice(-1000);
      await AsyncStorage.setItem('order_analytics_events', JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Failed to save order events:', error);
    }
  }

  /**
   * Load order events
   */
  private async loadOrderEvents(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('order_analytics_events');
      if (data) {
        this.orderEvents = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load order events:', error);
    }
  }

  /**
   * Clear old events (older than 90 days)
   */
  async clearOldEvents(): Promise<void> {
    const cutoffTime = Date.now() - 90 * 24 * 60 * 60 * 1000;
    this.orderEvents = this.orderEvents.filter(e => e.timestamp >= cutoffTime);
    await this.saveOrderEvents();
  }
}

export const orderAnalyticsService = new OrderAnalyticsService();








