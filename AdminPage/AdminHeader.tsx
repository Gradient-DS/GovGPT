import React from 'react';
import { X, Shield } from 'lucide-react';
import { Button } from '~/components/ui';

interface AdminHeaderProps {
  onClose: () => void;
  onResetAll: () => void;
  isUpdating: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  onClose,
  onResetAll,
  isUpdating
}) => {
  return (
    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage system settings and user access controls
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onResetAll}
            variant="outline"
            disabled={isUpdating}
            size="sm"
          >
            Reset All to Defaults
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader; 