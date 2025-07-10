import React, { useState, useEffect } from 'react';
import { SystemRoles } from 'librechat-data-provider';
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui';
import { useCreateAdminUserMutation, useUpdateAdminUserMutation } from '~/data-provider/UserManagement/queries';
import { useToastContext } from '~/Providers';
import { useLocalize } from '~/hooks';

interface User {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  role: string;
  emailVerified: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, isOpen, onClose }) => {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    role: SystemRoles.USER,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const createUserMutation = useCreateAdminUserMutation();
  const updateUserMutation = useUpdateAdminUserMutation();

  const isEditing = !!user;
  const isLoading = createUserMutation.isLoading || updateUserMutation.isLoading;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        name: user.name || '',
        username: user.username || '',
        role: user.role as SystemRoles,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        username: '',
        role: SystemRoles.USER,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required for new users';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && user) {
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          username: formData.username,
          role: formData.role,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateUserMutation.mutateAsync({
          userId: user._id,
          userData: updateData,
        });
        
        showToast({
          status: 'success',
          message: 'User updated successfully',
        });
      } else {
        await createUserMutation.mutateAsync(formData);
        
        showToast({
          status: 'success',
          message: 'User created successfully',
        });
      }
      
      onClose();
    } catch (error: any) {
      showToast({
        status: 'error',
        message: error?.message || `Failed to ${isEditing ? 'update' : 'create'} user`,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md px-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="johndoe"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value={SystemRoles.USER}>User</option>
              <option value={SystemRoles.ADMIN}>Admin</option>
            </select>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!isEditing && '*'}
              {isEditing && (
                <span className="text-sm text-gray-500 ml-1">
                  (leave blank to keep current password)
                </span>
              )}
            </Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={isEditing ? 'Enter new password' : 'Password'}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="mr-2"
              />
              <Label htmlFor="showPassword" className="text-sm">
                Show password
              </Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm; 