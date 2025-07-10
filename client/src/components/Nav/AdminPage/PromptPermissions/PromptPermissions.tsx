import React from 'react';
import { Brain } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Permissions, SystemRoles, roleDefaults, PermissionTypes } from 'librechat-data-provider';
import type { Control } from 'react-hook-form';
import { Switch } from '~/components/ui';
import { useUpdatePromptPermissionsMutation } from '~/data-provider';
import { useLocalize, useAuthContext } from '~/hooks';
import { useToastContext } from '~/Providers';

type FormValues = Partial<Record<Permissions, boolean>>;

type PermissionControllerProps = {
  label: string;
  description: string;
  permission: Permissions;
  control: Control<FormValues>;
  isUpdating: boolean;
};

const PermissionController: React.FC<PermissionControllerProps> = ({
  control,
  permission,
  label,
  description,
  isUpdating,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {description}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {isUpdating && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      )}
      <Controller
        name={permission}
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value || false}
            onCheckedChange={field.onChange}
            disabled={isUpdating}
          />
        )}
      />
    </div>
  </div>
);

const PromptPermissions: React.FC = () => {
  const localize = useLocalize();
  const { roles } = useAuthContext();
  const { showToast } = useToastContext();
  const [updatingPermission, setUpdatingPermission] = React.useState<string | null>(null);

  const { mutate } = useUpdatePromptPermissionsMutation({
    onSuccess: () => {
      showToast({ status: 'success', message: 'Saved' });
      setUpdatingPermission(null);
    },
    onError: () => {
      showToast({ status: 'error', message: 'Failed to save permission' });
      setUpdatingPermission(null);
    },
  });

  const defaultValues = React.useMemo(() => {
    if (roles?.[SystemRoles.USER]?.permissions) {
      return roles[SystemRoles.USER]?.permissions?.[PermissionTypes.PROMPTS];
    }
    return roleDefaults[SystemRoles.USER].permissions[PermissionTypes.PROMPTS];
  }, [roles]);

  const { control, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
  });

  const watchedValues = watch();

  // Auto-save with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(watchedValues).length > 0) {
        // Check if any values have actually changed from default
        const hasChanges = Object.entries(watchedValues).some(([key, value]) => {
          const defaultValue = defaultValues?.[key as Permissions];
          return value !== defaultValue;
        });

        if (hasChanges) {
          setUpdatingPermission('all');
          mutate({ 
            roleName: SystemRoles.USER, 
            updates: watchedValues 
          });
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedValues, defaultValues, mutate]);

  const permissionSettings = [
    {
      permission: Permissions.SHARED_GLOBAL,
      label: localize('com_ui_prompts_allow_share_global'),
      description: 'Allow users to share prompts globally with all users'
    },
    {
      permission: Permissions.CREATE,
      label: localize('com_ui_prompts_allow_create'),
      description: 'Allow users to create new prompts'
    }
    // Note: Removed Permissions.USE as it's redundant - enabling prompts implies usage permission
  ];

  return (
    <div className="ml-6 mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-l-green-500">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          Prompt Permissions
        </span>
      </div>
      <div className="space-y-1">
        {permissionSettings.map(({ permission, label, description }) => (
          <PermissionController
            key={permission}
            control={control}
            permission={permission}
            label={label}
            description={description}
            isUpdating={updatingPermission === permission || updatingPermission === 'all'}
          />
        ))}
      </div>
    </div>
  );
};

export default PromptPermissions; 