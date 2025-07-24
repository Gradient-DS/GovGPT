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
}

/**
 * React hook for interacting with the GovGPT Admin plugin config endpoints.
 *
 * GET  /api/admin/config          → fetch overrides
 * POST /api/admin/config          → { key, value }  (update single path)
 * POST /api/admin/config/apply    → regenerate merged YAML + restart flag
 */
export function useAdminConfig(): UseAdminConfig {
  const [overrides, setOverrides] = useState<Overrides>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch on mount
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/config');
        if (!res.ok) throw new Error(await res.text());
        const data: AdminConfigResponse = await res.json();
        setOverrides(data.overrides ?? {});
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const updateSetting = useCallback(async (key: string, value: unknown) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AdminConfigResponse = await res.json();
      setOverrides(data.overrides ?? {});
    } finally {
      setSaving(false);
    }
  }, []);

  const applyChanges = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config/apply', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    overrides,
    loading,
    error,
    saving,
    updateSetting,
    applyChanges,
  };
} 