import React from 'react';
import { Users, Shield, UserCheck, Calendar, CheckCircle } from 'lucide-react';

interface UserStatsProps {
  stats: {
    totalUsers: number;
    adminCount: number;
    userCount: number;
    verifiedUsers: number;
    recentUsers: number;
  };
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Shield,
      label: 'Admins',
      value: stats.adminCount,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      icon: UserCheck,
      label: 'Regular Users',
      value: stats.userCount,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: CheckCircle,
      label: 'Verified',
      value: stats.verifiedUsers,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Calendar,
      label: 'Recent (30d)',
      value: stats.recentUsers,
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.label}
            className={`${item.bgColor} p-4 rounded-lg border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${item.textColor}`}>
                  {item.value.toLocaleString()}
                </div>
                <div className={`text-sm ${item.textColor} font-medium`}>
                  {item.label}
                </div>
              </div>
              <IconComponent className={`w-8 h-8 ${item.textColor} opacity-80`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserStats; 