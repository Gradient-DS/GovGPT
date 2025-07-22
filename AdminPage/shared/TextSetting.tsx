import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '~/components/ui';

interface TextSettingProps {
  setting: {
    key: string;
    label: string;
    description: string;
    type?: 'text' | 'url' | 'textarea' | 'color';
    placeholder?: string;
  };
  effectiveValue: string;
  isOverride: boolean;
  isUpdating: boolean;
  onUpdate: (key: string, value: string) => void;
}

const TextSetting: React.FC<TextSettingProps> = ({
  setting,
  effectiveValue,
  isOverride,
  isUpdating,
  onUpdate,
}) => {
  const [localValue, setLocalValue] = useState(effectiveValue || '');

  useEffect(() => {
    setLocalValue(effectiveValue || '');
  }, [effectiveValue]);

  /** Update local state while typing */
  const handleChange = (value: string) => {
    setLocalValue(value);
  };

  /** Persist the value only after input loses focus */
  const handleBlur = () => {
    if (localValue !== effectiveValue) {
      onUpdate(setting.key, localValue);
    }
  };

  const handleReset = () => {
    onUpdate(setting.key, ''); // Reset to empty/default
  };

  const InputComponent = setting.type === 'textarea' ? Textarea : Input;

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {setting.label}
            </h4>
            {isUpdating && (
              <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {isOverride && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                Override
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {setting.description}
          </p>
        </div>
        
        {isOverride && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isUpdating}
            className="ml-4"
          >
            Use Default
          </Button>
        )}
      </div>

      {/* Input */}
      <div className="max-w-2xl">
        {setting.type === 'color' ? (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={localValue || '#3B82F6'}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={isUpdating}
              className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <Input
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={setting.placeholder || '#3B82F6'}
              disabled={isUpdating}
              className="flex-1"
              pattern="^#([0-9A-F]{3}){1,2}$"
            />
          </div>
        ) : (
          <InputComponent
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={setting.placeholder || `Enter ${setting.label.toLowerCase()}...`}
            disabled={isUpdating}
            className="w-full"
            {...(setting.type === 'textarea' ? { rows: 3 } : {})}
          />
        )}
        
        {/* Preview/validation feedback */}
        {setting.type === 'url' && localValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Preview: <span className="text-blue-600 dark:text-blue-400">{localValue}</span>
          </p>
        )}
        
        {setting.type === 'color' && localValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Color: <span className="text-blue-600 dark:text-blue-400">{localValue}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default TextSetting; 