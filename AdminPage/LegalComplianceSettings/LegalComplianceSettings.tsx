import React from 'react';
import { Shield } from 'lucide-react';
import SettingGroup from '../shared/SettingGroup';
import { SETTING_GROUPS } from '../constants';

interface LegalComplianceSettingsProps {
  adminConfig: any;
  getEffectiveValue: (key: string) => any;
  isOverride: (key: string) => boolean;
  isSettingUpdating: (key: string) => boolean;
  onUpdateSetting: (key: string, value: any) => void;
}

const LegalComplianceSettings: React.FC<LegalComplianceSettingsProps> = ({
  adminConfig,
  getEffectiveValue,
  isOverride,
  isSettingUpdating,
  onUpdateSetting,
}) => {
  const config = SETTING_GROUPS.legalCompliance;

  const handleObjectFieldUpdate = (objectKey: string, fieldKey: string, value: any) => {
    const currentObject = getEffectiveValue(objectKey) || {};
    const updatedObject = {
      ...currentObject,
      [fieldKey]: value,
    };
    onUpdateSetting(objectKey, updatedObject);
  };

  const handleObjectReset = (objectKey: string) => {
    onUpdateSetting(objectKey, null);
  };

  const getObjectFieldValue = (objectKey: string, fieldKey: string) => {
    const objectValue = getEffectiveValue(objectKey);
    return objectValue?.[fieldKey] ?? '';
  };

  const renderObjectSetting = (objectSetting: any) => {
    const isUpdating = isSettingUpdating(objectSetting.key);
    const hasOverride = isOverride(objectSetting.key);

    return (
      <div key={objectSetting.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {objectSetting.label}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {objectSetting.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasOverride && (
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                Override
              </span>
            )}
            {isUpdating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
            )}
            <button
              onClick={() => handleObjectReset(objectSetting.key)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isUpdating}
            >
              Use Default
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {objectSetting.fields.map((field: any) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {field.description}
              </p>
              
              {field.type === 'boolean' ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={getObjectFieldValue(objectSetting.key, field.key) || false}
                    onChange={(e) => handleObjectFieldUpdate(objectSetting.key, field.key, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                    disabled={isUpdating}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable {field.label.toLowerCase()}
                  </span>
                </label>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={getObjectFieldValue(objectSetting.key, field.key)}
                  onChange={(e) => handleObjectFieldUpdate(objectSetting.key, field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                  disabled={isUpdating}
                />
              ) : (
                <input
                  type={field.type === 'url' ? 'url' : 'text'}
                  value={getObjectFieldValue(objectSetting.key, field.key)}
                  onChange={(e) => handleObjectFieldUpdate(objectSetting.key, field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                  disabled={isUpdating}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <SettingGroup
      id="legalCompliance"
      title={config.title}
      description={config.description}
      icon={Shield}
    >
      <div className="space-y-6 py-6">
        {config.objectSettings?.map(renderObjectSetting)}
      </div>
    </SettingGroup>
  );
};

export default LegalComplianceSettings; 