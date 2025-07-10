import React from 'react';
import { Switch } from '~/components/ui';

interface ToggleSettingProps {
  setting: {
    key: string;
    label: string;
    description: string;
    inverted?: boolean;
  };
  effectiveValue: boolean;
  isOverride: boolean;
  isUpdating: boolean;
  onToggle: (key: string, value: boolean) => void;
  disabled?: boolean;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  setting,
  effectiveValue,
  isOverride,
  isUpdating,
  onToggle,
  disabled = false
}) => {
  const actualValue = setting.inverted ? !effectiveValue : effectiveValue;

  const handleToggle = (value: boolean) => {
    onToggle(setting.key, setting.inverted ? !value : value);
  };

  return (
    <div className={`flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-sm ${disabled ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {setting.label}
          </h4>
          {isOverride && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              Override
            </span>
          )}
          {isUpdating && (
            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <p className={`text-xs mt-1 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
          {setting.description}
        </p>
      </div>
      
      <div className="ml-4">
        <Switch
          checked={actualValue}
          onCheckedChange={handleToggle}
          disabled={isUpdating || disabled}
        />
      </div>
    </div>
  );
};

export default ToggleSetting; 