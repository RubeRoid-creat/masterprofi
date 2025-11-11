/**
 * Hook for feature flags
 */

import { useEffect, useState } from 'react';
import { featureFlags, FeatureFlags } from '../config/featureFlags';

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const [enabled, setEnabled] = useState(featureFlags.isEnabled(flag));

  useEffect(() => {
    // Check flag initially
    setEnabled(featureFlags.isEnabled(flag));

    // Listen for flag changes (if implemented)
    // In a real implementation, you might have an event emitter
    const checkFlag = () => {
      setEnabled(featureFlags.isEnabled(flag));
    };

    // Check periodically (e.g., every 30 seconds)
    const interval = setInterval(checkFlag, 30000);

    return () => clearInterval(interval);
  }, [flag]);

  return enabled;
}

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState(featureFlags.getAllFlags());

  useEffect(() => {
    const updateFlags = () => {
      setFlags({ ...featureFlags.getAllFlags() });
    };

    const interval = setInterval(updateFlags, 30000);
    return () => clearInterval(interval);
  }, []);

  return flags;
}








