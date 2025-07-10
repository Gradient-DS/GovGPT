import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Brain } from 'lucide-react';
import { Permissions, SystemRoles, roleDefaults, PermissionTypes } from 'librechat-data-provider';
import { useUpdateAgentPermissionsMutation } from '~/data-provider';
import { Switch } from '~/components/ui';
import { useLocalize, useAuthContext } from '~/hooks';
import { useToastContext } from '~/Providers';

type FormValues = Partial<Record<Permissions, boolean>>;

interface PermissionControlProps {
  label: string;
  description?: string;
  permission: Permissions;
  checked: boolean;
  onToggle: (permission: Permissions, value: boolean) => void;
  isUpdating: boolean;
}

const PermissionControl: React.FC<PermissionControlProps> = ({
  label,
  description,
  permission,
  checked,
  onToggle,
  isUpdating
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isUpdating && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        )}
        <Switch
          checked={checked}
          onCheckedChange={(value) => onToggle(permission, value)}
          disabled={isUpdating}
        />
      </div>
    </div>
  );
};

const AgentPermissions: React.FC = () => {
  const localize = useLocalize();
  const { user, roles } = useAuthContext();
  const { showToast } = useToastContext();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { mutate } = useUpdateAgentPermissionsMutation({
    onSuccess: () => {
      setIsUpdating(false);
      showToast({ status: 'success', message: 'Saved' });
    },
    onError: () => {
      setIsUpdating(false);
      showToast({ status: 'error', message: localize('com_ui_error_save_admin_settings') });
    },
  });

  const currentValues = useMemo(() => {
    if (roles?.[SystemRoles.USER]?.permissions) {
      return roles[SystemRoles.USER].permissions[PermissionTypes.AGENTS];
    }
    return roleDefaults[SystemRoles.USER].permissions[PermissionTypes.AGENTS];
  }, [roles]);

  const [localValues, setLocalValues] = useState<FormValues>(currentValues);

  useEffect(() => {
    setLocalValues(currentValues);
  }, [currentValues]);

  const debouncedSave = useCallback((newValues: FormValues) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setIsUpdating(true);
    const timer = setTimeout(() => {
      mutate({ roleName: SystemRoles.USER, updates: newValues });
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer, mutate]);

  const handleToggle = useCallback((permission: Permissions, value: boolean) => {
    const newValues = { ...localValues, [permission]: value };
    setLocalValues(newValues);
    debouncedSave(newValues);
  }, [localValues, debouncedSave]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const permissionData = [
    {
      permission: Permissions.CREATE,
      label: localize('com_ui_agents_allow_create'),
      description: 'Allow users to create new AI agents'
    },
    {
      permission: Permissions.SHARED_GLOBAL,
      label: localize('com_ui_agents_allow_share_global'),
      description: 'Allow users to share agents globally with all users'
    },
  ];

  return (
    <div className="ml-6 mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-l-green-500">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          Agent Permissions
        </span>
      </div>
      <div className="space-y-1">
        {permissionData.map(({ permission, label, description }) => (
          <PermissionControl
            key={permission}
            permission={permission}
            label={label}
            description={description}
            checked={localValues[permission] || false}
            onToggle={handleToggle}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
};

export default AgentPermissions; 