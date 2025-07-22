import React from 'react';
import { X } from 'lucide-react';
import { Button } from '~/components/ui';

interface ArraySettingProps {
  setting: {
    key: string;
    label: string;
    description: string;
    placeholder: string;
  };
  currentValues: string[];
  inputValue: string;
  isUpdating: boolean;
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string, value: string) => void;
  onInputChange: (key: string, value: string) => void;
}

const ArraySetting: React.FC<ArraySettingProps> = ({
  setting,
  currentValues,
  inputValue,
  isUpdating,
  onAdd,
  onRemove,
  onInputChange
}) => {
  const handleAdd = () => {
    if (inputValue.trim() && !currentValues.includes(inputValue.trim())) {
      onAdd(setting.key, inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

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

      {/* Current values */}
      {currentValues.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currently allowed: {currentValues.length} domain{currentValues.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1">
            {currentValues.map((value: string) => (
              <span
                key={value}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {value}
                <button
                  onClick={() => onRemove(setting.key, value)}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  disabled={isUpdating}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add new input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(setting.key, e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={setting.placeholder}
          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          disabled={isUpdating}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isUpdating || !inputValue.trim() || currentValues.includes(inputValue.trim())}
          className="text-xs px-2 py-1 h-7"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default ArraySetting; 