import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingGroupProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const SettingGroup: React.FC<SettingGroupProps> = ({
  id,
  title,
  description,
  icon: IconComponent,
  children
}) => {
  return (
    <div 
      id={id}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 scroll-mt-24"
    >
      {/* Group Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {/* Group Settings */}
      <div className="px-6">
        {children}
      </div>
    </div>
  );
};

export default SettingGroup; 