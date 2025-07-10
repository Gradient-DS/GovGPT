import React from 'react';
import { X } from 'lucide-react';
import { Button } from '~/components/ui';

interface MultiSelectSettingProps {
  setting: {
    key: string;
    label: string;
    description: string;
    options: string[];
  };
  currentValues: string[];
  isUpdating: boolean;
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string, value: string) => void;
  children?: React.ReactNode; // For additional content like provider configs
}

const MultiSelectSetting: React.FC<MultiSelectSettingProps> = ({
  setting,
  currentValues,
  isUpdating,
  onAdd,
  onRemove,
  children
}) => {
  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {setting.label}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {setting.description}
          </p>
        </div>
      </div>

      {/* Show selected options */}
      {currentValues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currently enabled:
          </p>
          <div className="flex flex-wrap gap-1">
            {currentValues.map((value: string) => (
              <span
                key={value}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              >
                {value}
                <button
                  onClick={() => onRemove(setting.key, value)}
                  className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                  disabled={isUpdating}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Available options to add */}
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available options:
        </p>
        <div className="flex flex-wrap gap-1">
          {setting.options
            .filter((option: string) => !currentValues.includes(option))
            .map((option: string) => (
              <Button
                key={option}
                size="sm"
                variant="outline"
                onClick={() => onAdd(setting.key, option)}
                disabled={isUpdating}
                className="text-xs px-2 py-1 h-6"
              >
                + {option}
              </Button>
            ))}
        </div>
      </div>

      {children}
    </div>
  );
};

export default MultiSelectSetting; 