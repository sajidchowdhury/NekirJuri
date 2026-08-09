'use client';

// ============================================================
// UserManagement — DataTable of users with role/status badges
// ============================================================

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, UserX, UserCheck, KeyRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/organisms/data-table';
import {
  type SystemUser,
  type UserRole,
  type UserStatus,
  getInitials,
  roleBadgeColors,
  userStatusColors,
} from '@/lib/system/sample-data';

interface UserManagementProps {
  users?: SystemUser[];
  isLoading?: boolean;
  onEditUser?: (user: SystemUser) => void;
  onAddUser?: () => void;
}

export default function UserManagement({ users: usersProp, isLoading, onEditUser, onAddUser }: UserManagementProps) {
  const users = usersProp ?? [];
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Active' | 'Inactive'>('All');

  const filteredUsers = React.useMemo(() => {
    if (statusFilter === 'All') return users;
    return users.filter((u) => u.status === statusFilter);
  }, [users, statusFilter]);

  const columns: ColumnDef<SystemUser, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role as UserRole;
        const colors = roleBadgeColors[role];
        return (
          <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0 text-xs font-medium`}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status as UserStatus;
        const colors = userStatusColors[status];
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${colors.dot}`} />
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.lastLogin}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.createdAt}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditUser?.(user)} className="gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Toggle status handled by parent via API
                  onEditUser?.(user);
                }}
                className="gap-2 cursor-pointer"
              >
                {user.status === 'Active' ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <KeyRound className="h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filterTabs: Array<{ label: string; value: 'All' | 'Active' | 'Inactive'; count: number }> = [
    { label: 'All', value: 'All', count: users.length },
    { label: 'Active', value: 'Active', count: users.filter((u) => u.status === 'Active').length },
    { label: 'Inactive', value: 'Inactive', count: users.filter((u) => u.status === 'Inactive').length },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
            className={
              statusFilter === tab.value
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : ''
            }
          >
            {tab.label}
            <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Desktop: DataTable */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchKey="name"
          searchPlaceholder="Search users..."
          isLoading={isLoading}
          emptyMessage="No users found"
          emptyDescription="Add your first user to get started."
        />
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user) => {
          const roleColor = roleBadgeColors[user.role as UserRole];
          const statusColor = userStatusColors[user.status as UserStatus];
          return (
            <div
              key={user.id}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditUser?.(user)} className="gap-2 cursor-pointer">
                      <Pencil className="h-4 w-4" /> Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <KeyRound className="h-4 w-4" /> Reset Password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${roleColor.bg} ${roleColor.text} border-0 text-xs`}>
                  {user.role}
                </Badge>
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusColor.dot}`} />
                  {user.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last login: {user.lastLogin}</span>
                <span>Created: {user.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
