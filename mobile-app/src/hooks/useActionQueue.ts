/**
 * Hook for action queue management
 */

import { useState, useEffect, useCallback } from 'react';
import { actionQueueService } from '../services/actionQueueService';
import {
  QueuedAction,
  ActionType,
  ActionPayload,
  ActionQueueStats,
} from '../types/actionQueue';

export interface UseActionQueueReturn {
  stats: ActionQueueStats;
  actions: QueuedAction[];
  isLoading: boolean;
  enqueue: (type: ActionType, payload: ActionPayload, metadata?: QueuedAction['metadata']) => Promise<string>;
  dequeue: (actionId: string) => Promise<void>;
  getAction: (actionId: string) => QueuedAction | undefined;
  resolveConflict: (actionId: string, resolution: 'local_wins' | 'server_wins' | 'merge', mergedData?: any) => Promise<void>;
  clearCompleted: () => Promise<void>;
  retryAction: (actionId: string) => Promise<void>;
}

export function useActionQueue(): UseActionQueueReturn {
  const [stats, setStats] = useState<ActionQueueStats>(actionQueueService.getStats());
  const [actions, setActions] = useState<QueuedAction[]>(actionQueueService.getAllActions());
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    setStats(actionQueueService.getStats());
    setActions(actionQueueService.getAllActions());
  }, []);

  const enqueue = useCallback(
    async (type: ActionType, payload: ActionPayload, metadata?: QueuedAction['metadata']) => {
      setIsLoading(true);
      try {
        const id = await actionQueueService.enqueue(type, payload, metadata);
        refresh();
        return id;
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
  );

  const dequeue = useCallback(
    async (actionId: string) => {
      await actionQueueService.dequeue(actionId);
      refresh();
    },
    [refresh]
  );

  const getAction = useCallback((actionId: string) => {
    return actionQueueService.getAction(actionId);
  }, []);

  const resolveConflict = useCallback(
    async (actionId: string, resolution: 'local_wins' | 'server_wins' | 'merge', mergedData?: any) => {
      setIsLoading(true);
      try {
        await actionQueueService.resolveConflict(actionId, resolution, mergedData);
        refresh();
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
  );

  const clearCompleted = useCallback(async () => {
    await actionQueueService.clearCompleted();
    refresh();
  }, [refresh]);

  const retryAction = useCallback(
    async (actionId: string) => {
      const action = actionQueueService.getAction(actionId);
      if (action && (action.status === 'failed' || action.status === 'conflict')) {
        await actionQueueService.updateAction(actionId, {
          status: 'pending',
          retryCount: 0,
          error: undefined,
        });
        refresh();
        // Trigger processing
        actionQueueService.processQueue();
      }
    },
    [refresh]
  );

  useEffect(() => {
    refresh();

    const unsubscribe = actionQueueService.addListener((newStats) => {
      setStats(newStats);
      setActions(actionQueueService.getAllActions());
    });

    return unsubscribe;
  }, [refresh]);

  return {
    stats,
    actions,
    isLoading,
    enqueue,
    dequeue,
    getAction,
    resolveConflict,
    clearCompleted,
    retryAction,
  };
}

