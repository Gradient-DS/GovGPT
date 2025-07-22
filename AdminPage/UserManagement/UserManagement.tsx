import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, Eye, Edit, Trash2, Shield, User } from 'lucide-react';
import { SystemRoles, type TUser } from 'librechat-data-provider';
import { SettingGroup } from '../shared';
import { Button, Input, Badge } from '~/components/ui';
import { useGetAdminUsersQuery, useDeleteAdminUserMutation, useGetAdminUserStatsQuery } from '~/data-provider/UserManagement/queries';
import { useToastContext } from '~/Providers';
import { useLocalize } from '~/hooks';
import UserForm from './UserForm';
import UserStats from './UserStats';
import ConfirmDialog from './ConfirmDialog';

interface ExtendedUser extends TUser {
  _id: string;
  emailVerified: boolean;
}

const UserManagement: React.FC = () => {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ExtendedUser | null>(null);
  const limit = 10;

  // Debounced search term
  const debouncedSearchTerm = useMemo(() => {
    const timer = setTimeout(() => searchTerm, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Queries
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetAdminUsersQuery({
    page: currentPage,
    limit,
    search: searchTerm,
  });

  const { data: statsData } = useGetAdminUserStatsQuery();

  // Mutations
  const deleteUserMutation = useDeleteAdminUserMutation();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (user: ExtendedUser) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete._id);
      showToast({
        status: 'success',
        message: `User ${userToDelete.email} deleted successfully`,
      });
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      showToast({
        status: 'error',
        message: error?.message || 'Failed to delete user',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (role: string) => {
    const isAdmin = role === SystemRoles.ADMIN;
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isAdmin 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}
      >
        {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
        {role}
      </span>
    );
  };

  if (usersError) {
    return (
      <SettingGroup
        id="userManagement"
        title="User Management"
        description="Manage users and administrators"
        icon={Users}
      >
        <div className="text-red-500 p-4">
          Error loading users: {(usersError as any)?.message || 'An error occurred'}
        </div>
      </SettingGroup>
    );
  }

  return (
    <SettingGroup
      id="userManagement"
      title="User Management"
      description="Manage users and administrators"
      icon={Users}
    >
      <div className="space-y-6 py-4">
        {/* User Statistics */}
        {statsData && <UserStats stats={statsData} />}

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users by email, name, or username..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : usersData?.users?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  usersData?.users?.map((user) => (
                    <tr key={(user as any)._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          {user.username && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {user.provider}
                      </td>
                      <td className="px-4 py-4">
                        <span 
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            (user as any).emailVerified 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {(user as any).emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user as any)}
                            className="p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user as any)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((usersData.pagination.currentPage - 1) * usersData.pagination.limit) + 1} to{' '}
                {Math.min(usersData.pagination.currentPage * usersData.pagination.limit, usersData.pagination.totalUsers)} of{' '}
                {usersData.pagination.totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(usersData.pagination.currentPage - 1)}
                  disabled={usersData.pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {usersData.pagination.currentPage} of {usersData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(usersData.pagination.currentPage + 1)}
                  disabled={usersData.pagination.currentPage === usersData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User Form Modal */}
        {isFormOpen && (
          <UserForm
            user={selectedUser}
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedUser(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteConfirmOpen && userToDelete && (
          <ConfirmDialog
            isOpen={isDeleteConfirmOpen}
            title="Delete User"
            message={`Are you sure you want to delete user "${userToDelete.email}"? This action cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={confirmDeleteUser}
            onCancel={() => {
              setIsDeleteConfirmOpen(false);
              setUserToDelete(null);
            }}
            isLoading={deleteUserMutation.isLoading}
          />
        )}
      </div>
    </SettingGroup>
  );
};

export default UserManagement; 