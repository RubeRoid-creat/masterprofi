/**
 * Hook for image preloading
 */

import { useEffect, useCallback, useState } from 'react';
import { imageService, PreloadOptions } from '../services/imageService';

export interface UseImagePreloadOptions extends PreloadOptions {
  enabled?: boolean;
}

/**
 * Hook to preload images
 */
export function useImagePreload(
  uris: string[],
  options: UseImagePreloadOptions = {}
): {
  preload: () => Promise<void>;
  isLoading: boolean;
} {
  const { enabled = true, ...preloadOptions } = options;
  const [isLoading, setIsLoading] = useState(false);

  const preload = useCallback(async () => {
    if (!enabled || uris.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await imageService.preloadImages(uris, preloadOptions);
    } finally {
      setIsLoading(false);
    }
  }, [uris, enabled, preloadOptions]);

  useEffect(() => {
    if (enabled) {
      preload();
    }
  }, [enabled, preload]);

  return { preload, isLoading };
}

/**
 * Hook to preload critical images on mount
 */
export function useCriticalImagePreload(uris: string[]): void {
  useEffect(() => {
    if (uris.length > 0) {
      imageService.preloadImages(uris, { priority: 'high' });
    }
  }, [uris]);
}

/**
 * Hook to preload images on visibility
 */
export function usePreloadOnVisible(
  uri: string,
  isVisible: boolean,
  options: PreloadOptions = {}
): void {
  useEffect(() => {
    if (isVisible && uri) {
      imageService.preloadImage(uri, { ...options, priority: 'high' });
    }
  }, [uri, isVisible, options]);
}

