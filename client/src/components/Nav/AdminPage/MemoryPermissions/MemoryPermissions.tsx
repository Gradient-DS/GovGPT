import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { Permissions, SystemRoles, roleDefaults, PermissionTypes } from 'librechat-data-provider';
import { useUpdateMemoryPermissionsMutation } from '~/data-provider';
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

const MemoryPermissions: React.FC = () => {
  const localize = useLocalize();
  const { user, roles } = useAuthContext();
  const { showToast } = useToastContext();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { mutate } = useUpdateMemoryPermissionsMutation({
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
      return roles[SystemRoles.USER]?.permissions?.[PermissionTypes.MEMORIES];
    }
    return roleDefaults[SystemRoles.USER].permissions[PermissionTypes.MEMORIES];
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
      label: localize('com_ui_memories_allow_create'),
      description: 'Allow users to create new memories'
    },
    {
      permission: Permissions.UPDATE,
      label: localize('com_ui_memories_allow_update'),
      description: 'Allow users to update existing memories'
    },
    {
      permission: Permissions.READ,
      label: localize('com_ui_memories_allow_read'),
      description: 'Allow users to read their memories'
    },
    {
      permission: Permissions.OPT_OUT,
      label: localize('com_ui_memories_allow_opt_out'),
      description: 'Allow users to opt out of memory functionality'
    },
  ];

  return (
    <div className="ml-6 mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-l-blue-500">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Memory Permissions
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

export default MemoryPermissions; 