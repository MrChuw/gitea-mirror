import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/utils';
import type { ConfigApiResponse, GiteaConfig } from '@/types/config';
import { getCachedConfig } from './useConfigStatus';

interface GiteaConfigHook {
  giteaConfig: GiteaConfig | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get Gitea configuration data
 * Uses the same cache as useConfigStatus to prevent duplicate API calls
 */
export function useGiteaConfig(): GiteaConfigHook {
  const { user } = useAuth();
  const [giteaConfigState, setGiteaConfigState] = useState<GiteaConfigHook>({
    giteaConfig: null,
    isLoading: true,
    error: null,
  });

  const fetchGiteaConfig = useCallback(async () => {
    if (!user?.id) {
      setGiteaConfigState({
        giteaConfig: null,
        isLoading: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Try to get from cache first
    const cachedConfig = getCachedConfig();
    if (cachedConfig) {
      setGiteaConfigState({
        giteaConfig: cachedConfig.giteaConfig || null,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setGiteaConfigState(prev => ({ ...prev, isLoading: true, error: null }));

      const configResponse = await apiRequest<ConfigApiResponse>(
        `/config?userId=${user.id}`,
        { method: 'GET' }
      );

      setGiteaConfigState({
        giteaConfig: configResponse?.giteaConfig || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setGiteaConfigState({
        giteaConfig: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Gitea configuration',
      });
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGiteaConfig();
  }, [fetchGiteaConfig]);

  return giteaConfigState;
}
