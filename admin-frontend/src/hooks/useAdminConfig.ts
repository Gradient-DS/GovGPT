import { useEffect, useState, useCallback } from 'react';

interface Overrides {
  [key: string]: unknown;
}

interface AdminConfigResponse {
  overrides?: Overrides;
}

interface UseAdminConfig {
  overrides: Overrides | undefined;
  loading: boolean;
  error: string | null;
  saving: boolean;
  updateSetting: (key: string, value: unknown) => Promise<void>;
  applyChanges: () => Promise<void>;
  isAuthError: boolean;
}

/**
 * React hook for interacting with the GovGPT Admin plugin config endpoints.
 *
 * GET  /admin/config          → fetch overrides
 * POST /admin/config          → { key, value }  (update single path)
 * POST /admin/config/apply    → regenerate merged YAML + restart flag
 */
export function useAdminConfig(): UseAdminConfig {
  const [overrides, setOverrides] = useState<Overrides>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }, [token]);

  /* ------------------------------------------------------------------ */
  /* Step 1: Obtain an access token by exchanging the refresh cookie.    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    // Only attempt to fetch a token once on mount
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to refresh token (${res.status})`);
        }

        // The endpoint sometimes returns plain text when no token is available
        const data = await res.json().catch(() => null);
        const newToken: string | undefined = (data && data.token) || undefined;

        if (!newToken) {
          console.log('[Admin] No JWT token returned – user not logged in. Redirecting to /login');
          window.location.replace('/login');
          return;
        }

        setToken(newToken);
      } catch (err) {
        console.warn('[Admin] Unable to obtain JWT token:', err);
        setIsAuthError(true);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    if (token === null) {
      fetchToken();
    }
  }, [token]);

  const handleResponse = async (response: Response) => {
    console.log('handleResponse called');
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('401 Unauthorized detected');
      setIsAuthError(true);
      throw new Error('Authentication required. Please log in to LibreChat first.');
    }
    if (response.status === 403) {
      console.log('403 Forbidden detected');
      setIsAuthError(true);
      throw new Error('Access denied. Admin privileges required.');
    }
    if (!response.ok) {
      console.log('Non-OK response detected');
      const errorText = await response.text();
      console.log('Error response text:', errorText);
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('Response is OK');
    return response;
  };

  /* ------------------------------------------------------------ */
  /* Step 2: Fetch current config after we have a valid token     */
  /* ------------------------------------------------------------ */

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchConfig = async () => {
      console.log('\n=== FETCHING CONFIG ===');
      setLoading(true);
      setError(null);
      setIsAuthError(false);
      
      try {
        const url = '/admin/config';
        const headers = getAuthHeaders();
        
        console.log('Making fetch request to:', url);
        console.log('With headers:', headers);
        console.log('With credentials: include');
        
        const res = await fetch(url, {
          headers,
          credentials: 'include', // Important: include cookies for authentication
        });
        
        console.log('Fetch completed, handling response...');
        await handleResponse(res);
        
        console.log('Parsing JSON response...');
        const data: AdminConfigResponse = await res.json();
        console.log('Response data:', data);
        
        setOverrides(data.overrides ?? {});
        console.log('Config fetch successful');
      } catch (err) {
        console.log('Config fetch error:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
        console.log('Config fetch completed');
      }
    };

    fetchConfig();
  }, [getAuthHeaders, token]);

  const updateSetting = useCallback(async (key: string, value: unknown) => {
    console.log('\n=== UPDATING SETTING ===');
    console.log('Key:', key);
    console.log('Value:', value);
    
    setSaving(true);
    try {
      const url = '/admin/config';
      const headers = getAuthHeaders();
      const body = JSON.stringify({ key, value });
      
      console.log('Making POST request to:', url);
      console.log('With headers:', headers);
      console.log('With body:', body);
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include', // Important: include cookies for authentication
        body,
      });
      
      console.log('POST completed, handling response...');
      await handleResponse(res);
      
      console.log('Parsing JSON response...');
      const data: AdminConfigResponse = await res.json();
      console.log('Response data:', data);
      
      setOverrides(data.overrides ?? {});
      console.log('Setting update successful');
    } catch (err) {
      console.log('Setting update error:', err);
      throw err;
    } finally {
      setSaving(false);
      console.log('Setting update completed');
    }
  }, [getAuthHeaders]);

  const applyChanges = useCallback(async () => {
    console.log('\n=== APPLYING CHANGES ===');
    setSaving(true);
    try {
      const url = '/admin/config/apply';
      const headers = getAuthHeaders();
      
      console.log('Making POST request to:', url);
      console.log('With headers:', headers);
      
      const res = await fetch(url, { 
        method: 'POST',
        headers,
        credentials: 'include', // Important: include cookies for authentication
      });
      
      console.log('POST completed, handling response...');
      await handleResponse(res);
      console.log('Apply changes successful');
    } catch (err) {
      console.log('Apply changes error:', err);
      throw err;
    } finally {
      setSaving(false);
      console.log('Apply changes completed');
    }
  }, [getAuthHeaders]);

  return {
    overrides,
    loading,
    error,
    saving,
    updateSetting,
    applyChanges,
    isAuthError,
  };
} 