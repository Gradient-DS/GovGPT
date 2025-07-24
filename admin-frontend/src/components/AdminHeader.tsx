import React from 'react';
import { LayoutDashboard, Menu } from 'lucide-react';

interface AdminHeaderProps {
  saving: boolean;
  onApplyChanges: () => void;
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ saving, onApplyChanges, onToggleSidebar }) => {
  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-20">
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mr-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <h1 className="flex items-center text-xl font-medium m-0">
          <LayoutDashboard className="w-5 h-5" />
          <span className="ml-2">Admin Settings</span>
        </h1>
      </div>
      
      <button
        onClick={onApplyChanges}
        disabled={saving}
        className={`
          px-6 py-3 bg-blue-600 text-white border-0 rounded-md text-sm font-medium
          transition-all duration-200
          ${saving 
            ? 'cursor-not-allowed opacity-60' 
            : 'cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        `}
      >
        {saving ? 'Applying…' : 'Apply & Restart'}
      </button>
    </div>
  );
}; 