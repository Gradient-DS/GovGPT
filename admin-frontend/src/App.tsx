import React, { type FC, useMemo } from 'react';
import { useAdminConfig } from './hooks/useAdminConfig';
import { SETTING_GROUPS } from './constants';
import { AdminLayout } from './components';
import { createValuesMap } from './utils/helpers';

const App: FC = () => {
  const { overrides, loading, error, saving, updateSetting, applyChanges, isAuthError } = useAdminConfig();

  const values = useMemo<Record<string, unknown>>(() => {
    return createValuesMap(overrides, SETTING_GROUPS);
  }, [overrides]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading…</p>
      </div>
    );
  }

  if (isAuthError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-lg text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <a
              href="/"
              className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to LibreChat
            </a>
            <button
              onClick={() => window.location.reload()}
              className="inline-block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <AdminLayout
      values={values}
      saving={saving}
      onUpdateSetting={updateSetting}
      onApplyChanges={applyChanges}
    />
  );
};

export default App; 