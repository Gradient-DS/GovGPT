import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { SETTING_GROUPS } from './constants';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange
}) => {
  // Auto-scroll the active button into view when activeSection changes
  useEffect(() => {
    const el = document.getElementById(`admin-nav-${activeSection}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeSection]);

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Navigation
        </h3>
        <nav className="space-y-1">
          {Object.entries(SETTING_GROUPS).map(([groupKey, group]) => {
            const IconComponent = group.icon;
            const isActive = activeSection === groupKey;
            
            return (
              <button
                id={`admin-nav-${groupKey}`}
                key={groupKey}
                onClick={() => onSectionChange(groupKey)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{group.title}</span>
                {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar; 