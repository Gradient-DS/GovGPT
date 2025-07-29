import { useEffect, useState, useCallback, useMemo } from 'react';
import _ from 'lodash';

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
  restarting: boolean;
  dirty: boolean;
  draft: Overrides;
  editDraft: (key: string, value: unknown) => void;
  discardDraft: () => void;
  applyChanges: () => Promise<void>;
  isAuthError: boolean;
}

/**
 * React hook for interacting with the GovGPT Admin plugin config endpoints.
 *
 * GET  /admin/config          → fetch overrides
 * POST /admin/config          → { key, value }  (update single path)
 */
export function useAdminConfig(): UseAdminConfig {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // saving is used for background POSTs (should be rare once we batch apply)
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const [overrides, setOverrides] = useState<Overrides>();
  const [draft, setDraft] = useState<Overrides>({});
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
        
        const serverOverrides = data.overrides ?? {};
        setOverrides(serverOverrides);
        setDraft(_.cloneDeep(serverOverrides));
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

  const editDraft = useCallback((key: string, value: unknown) => {
    setDraft((prev) => {
      const clone = _.cloneDeep(prev);
      _.set(clone, key, value);
      return clone;
    });
  }, []);

  const discardDraft = useCallback(() => {
    if (overrides) {
      setDraft(_.cloneDeep(overrides));
    }
  }, [overrides]);

  const applyChanges = useCallback(async () => {
    if (!overrides) return;

    console.log('\n=== APPLYING DRAFT CHANGES ===');
    setSaving(true);
    try {
      // Flatten objects to dot-notated paths to compare values
      const flatten = (obj: any, prefix = ''): Record<string, unknown> => {
        return Object.keys(obj).reduce((acc: any, key) => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (_.isObjectLike(obj[key]) && !Array.isArray(obj[key])) {
            Object.assign(acc, flatten(obj[key], path));
          } else {
            acc[path] = obj[key];
          }
          return acc;
        }, {});
      };

      const flatDraft = flatten(draft);
      const flatOverrides = flatten(overrides);

      const headers = getAuthHeaders();

      const diff: Record<string, unknown> = {};
      for (const [path, val] of Object.entries(flatDraft)) {
        if (!_.isEqual(val, flatOverrides[path])) {
          diff[path] = val;
        }
      }

      // Send entire draft so server writes complete YAML
      setRestarting(true);
      await fetch('/admin/config', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ overrides: draft }),
      });
    } finally {
      setSaving(false);
    }
  }, [draft, overrides, getAuthHeaders, handleResponse]);

  const dirty = useMemo(() => {
    if (!overrides) return false;
    return !_.isEqual(draft, overrides);
  }, [draft, overrides]);

  return {
    overrides,
    loading,
    error,
    saving,
    restarting,
    dirty,
    draft,
    editDraft,
    discardDraft,
    applyChanges,
    isAuthError,
  };
} 