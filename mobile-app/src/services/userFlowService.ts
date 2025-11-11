/**
 * User Flow Analysis Service
 * Tracks user navigation flows and paths
 */

import { analyticsService } from './analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FlowStep {
  screen: string;
  timestamp: number;
  action?: string;
  properties?: Record<string, any>;
}

export interface UserFlow {
  flowId: string;
  startScreen: string;
  endScreen?: string;
  steps: FlowStep[];
  duration?: number;
  completed: boolean;
}

export interface FlowAnalysis {
  flowName: string;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  averageDuration: number;
  commonPaths: Array<{ path: string[]; count: number }>;
  dropoffPoints: { [screen: string]: number };
}

class UserFlowService {
  private currentFlow: UserFlow | null = null;
  private completedFlows: UserFlow[] = [];
  private flowDefinitions: Map<string, { start: string; end: string; name: string }> = new Map();

  /**
   * Initialize user flow tracking
   */
  initialize(): void {
    this.loadCompletedFlows();
    this.setupDefaultFlows();
  }

  /**
   * Setup default flow definitions
   */
  private setupDefaultFlows(): void {
    // Define common user flows
    this.flowDefinitions.set('order_flow', {
      name: 'Order Completion Flow',
      start: 'OrderFeed',
      end: 'OrderDetails',
    });

    this.flowDefinitions.set('registration_flow', {
      name: 'Registration Flow',
      start: 'Registration',
      end: 'OrderFeed',
    });

    this.flowDefinitions.set('payment_flow', {
      name: 'Payment Flow',
      start: 'OrderDetails',
      end: 'PaymentSuccess',
    });
  }

  /**
   * Start tracking a flow
   */
  startFlow(flowId: string, startScreen: string): void {
    // End current flow if exists
    if (this.currentFlow) {
      this.endFlow();
    }

    this.currentFlow = {
      flowId,
      startScreen,
      steps: [{
        screen: startScreen,
        timestamp: Date.now(),
      }],
      completed: false,
    };

    analyticsService.track('flow_started', {
      flowId,
      startScreen,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track flow step
   */
  trackFlowStep(screen: string, action?: string, properties?: Record<string, any>): void {
    if (!this.currentFlow) {
      return;
    }

    this.currentFlow.steps.push({
      screen,
      timestamp: Date.now(),
      action,
      properties,
    });

    analyticsService.track('flow_step', {
      flowId: this.currentFlow.flowId,
      screen,
      action,
      stepNumber: this.currentFlow.steps.length,
      ...properties,
      timestamp: new Date().toISOString(),
    });

    // Check if flow completed
    const flowDef = this.flowDefinitions.get(this.currentFlow.flowId);
    if (flowDef && screen === flowDef.end) {
      this.completeFlow();
    }
  }

  /**
   * Complete current flow
   */
  completeFlow(endScreen?: string): void {
    if (!this.currentFlow) {
      return;
    }

    this.currentFlow.endScreen = endScreen || this.currentFlow.steps[this.currentFlow.steps.length - 1]?.screen;
    this.currentFlow.completed = true;
    this.currentFlow.duration = Date.now() - this.currentFlow.steps[0].timestamp;

    analyticsService.track('flow_completed', {
      flowId: this.currentFlow.flowId,
      duration: this.currentFlow.duration,
      steps: this.currentFlow.steps.length,
      timestamp: new Date().toISOString(),
    });

    this.completedFlows.push(this.currentFlow);
    this.currentFlow = null;

    // Keep only last 1000 flows
    if (this.currentFlow.length > 1000) {
      this.completedFlows = this.completedFlows.slice(-1000);
    }

    this.saveCompletedFlows();
  }

  /**
   * End current flow (without completion)
   */
  endFlow(reason?: string): void {
    if (!this.currentFlow) {
      return;
    }

    const lastStep = this.currentFlow.steps[this.currentFlow.steps.length - 1];
    this.currentFlow.endScreen = lastStep?.screen;
    this.currentFlow.duration = Date.now() - this.currentFlow.steps[0].timestamp;

    analyticsService.track('flow_abandoned', {
      flowId: this.currentFlow.flowId,
      lastScreen: lastStep?.screen,
      steps: this.currentFlow.steps.length,
      duration: this.currentFlow.duration,
      reason,
      timestamp: new Date().toISOString(),
    });

    this.completedFlows.push(this.currentFlow);
    this.currentFlow = null;

    this.saveCompletedFlows();
  }

  /**
   * Analyze flow
   */
  async analyzeFlow(flowId: string): Promise<FlowAnalysis | null> {
    const flows = this.completedFlows.filter(f => f.flowId === flowId);
    if (flows.length === 0) {
      return null;
    }

    const completedFlows = flows.filter(f => f.completed);
    const completionRate = (completedFlows.length / flows.length) * 100;

    const averageDuration = completedFlows.length > 0
      ? completedFlows.reduce((sum, f) => sum + (f.duration || 0), 0) / completedFlows.length
      : 0;

    // Find common paths
    const pathCounts = new Map<string, number>();
    flows.forEach(flow => {
      const path = flow.steps.map(s => s.screen).join(' -> ');
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
    });

    const commonPaths = Array.from(pathCounts.entries())
      .map(([path, count]) => ({
        path: path.split(' -> '),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Find dropoff points
    const dropoffPoints: { [screen: string]: number } = {};
    flows.forEach(flow => {
      if (!flow.completed && flow.steps.length > 0) {
        const lastScreen = flow.steps[flow.steps.length - 1].screen;
        dropoffPoints[lastScreen] = (dropoffPoints[lastScreen] || 0) + 1;
      }
    });

    const flowDef = this.flowDefinitions.get(flowId);

    return {
      flowName: flowDef?.name || flowId,
      totalStarts: flows.length,
      totalCompletions: completedFlows.length,
      completionRate,
      averageDuration,
      commonPaths,
      dropoffPoints,
    };
  }

  /**
   * Get flow funnel
   */
  async getFlowFunnel(flowId: string): Promise<Array<{ step: string; users: number; dropoff: number }>> {
    const flows = this.completedFlows.filter(f => f.flowId === flowId);
    if (flows.length === 0) {
      return [];
    }

    const stepCounts = new Map<string, number>();
    flows.forEach(flow => {
      flow.steps.forEach((step, index) => {
        const stepKey = `${index}_${step.screen}`;
        stepCounts.set(stepKey, (stepCounts.get(stepKey) || 0) + 1);
      });
    });

    const funnel: Array<{ step: string; users: number; dropoff: number }> = [];
    let previousUsers = flows.length;

    stepCounts.forEach((count, stepKey) => {
      const [, screen] = stepKey.split('_');
      const dropoff = previousUsers - count;
      funnel.push({
        step: screen,
        users: count,
        dropoff: dropoff / previousUsers * 100,
      });
      previousUsers = count;
    });

    return funnel;
  }

  /**
   * Save completed flows
   */
  private async saveCompletedFlows(): Promise<void> {
    try {
      // Keep only last 1000 flows
      const flowsToSave = this.completedFlows.slice(-1000);
      await AsyncStorage.setItem('user_flows', JSON.stringify(flowsToSave));
    } catch (error) {
      console.error('Failed to save user flows:', error);
    }
  }

  /**
   * Load completed flows
   */
  private async loadCompletedFlows(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('user_flows');
      if (data) {
        this.completedFlows = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load user flows:', error);
    }
  }

  /**
   * Register custom flow
   */
  registerFlow(flowId: string, name: string, startScreen: string, endScreen: string): void {
    this.flowDefinitions.set(flowId, { name, start: startScreen, end: endScreen });
  }

  /**
   * Clear flows (for testing)
   */
  async clearFlows(): Promise<void> {
    this.completedFlows = [];
    this.currentFlow = null;
    await AsyncStorage.removeItem('user_flows');
  }
}

export const userFlowService = new UserFlowService();








