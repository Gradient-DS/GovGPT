import React, { type FC, useMemo } from 'react';
import { useAdminConfig } from './hooks/useAdminConfig';
import { SETTING_GROUPS } from './constants';
import { AdminLayout } from './components';
import { createValuesMap } from './utils/helpers';

const App: FC = () => {
  const { overrides, loading, error, saving, updateSetting, applyChanges } = useAdminConfig();

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