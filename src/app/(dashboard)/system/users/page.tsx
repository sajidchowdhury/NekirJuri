'use client';

// ============================================================
// Users & Roles Page — Users tab + Roles & Permissions tab
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Users, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import UserManagement from '@/components/system/user-management';
import UserForm from '@/components/system/user-form';
import RoleManager from '@/components/system/role-manager';
import PermissionMatrix from '@/components/system/permission-matrix';
import {
  type SystemUser,
  type Role,
} from '@/lib/system/sample-data';
import { fadeIn, slideUp, staggerChildren, transitions } from '@/lib/animations';

// ── Types ────────────────────────────────────────────────

interface ApiUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt?: string;
  createdAt: string;
  userRoles: Array<{
    role: {
      name: string;
      rolePermissions: Array<{
        permission: { module: string; action: string };
      }>;
    };
  }>;
}

interface ApiRole {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  rolePermissions: Array<{
    permission: { module: string; action: string };
  }>;
  _count: { userRoles: number };
}

// ── Mappers ──────────────────────────────────────────────

function mapApiUserToSystemUser(apiUser: ApiUser): SystemUser {
  const primaryRole = apiUser.userRoles[0]?.role?.name || 'Viewer';
  const modules = [...new Set(
    apiUser.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.module)
    )
  )] as SystemUser['modules'];

  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone || '',
    role: primaryRole as SystemUser['role'],
    status: apiUser.isActive ? 'Active' : 'Inactive',
    lastLogin: apiUser.lastLoginAt
      ? new Date(apiUser.lastLoginAt).toLocaleString()
      : 'Never',
    createdAt: apiUser.createdAt.split('T')[0],
    modules,
  };
}

function mapApiRoleToRole(apiRole: ApiRole): Role {
  return {
    id: String(apiRole.id),
    name: apiRole.name as Role['name'],
    isSystem: apiRole.isSystem,
    userCount: apiRole._count.userRoles,
    description: apiRole.description || '',
    permissions: apiRole.rolePermissions.map(rp =>
      `${rp.permission.module}.${rp.permission.action}`
    ),
  };
}

// ── Page ─────────────────────────────────────────────────

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<SystemUser | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  // ── Fetch users ──────────────────────────────────────
  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users?limit=100');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });
  const users: SystemUser[] = (usersResponse?.data || []).map(mapApiUserToSystemUser);

  // ── Fetch roles ──────────────────────────────────────
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles?limit=50');
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 min — roles change rarely
  });
  const roles: Role[] = (rolesResponse?.data || []).map(mapApiRoleToRole);

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setPermissionDialogOpen(true);
  };

  // Error state
  if (usersError) {
    return (
      <motion.div initial={fadeIn.initial} animate={fadeIn.animate} transition={transitions.normal} className="space-y-6">
        <PageHeader title="Users & Roles" description="Manage system users, roles, and permissions" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load users</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching user data. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetchUsers()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Users & Roles"
        description="Manage system users, roles, and permissions"

        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAddUserDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4 hidden sm:inline" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-1.5">
              <Shield className="h-4 w-4 hidden sm:inline" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Users */}
          <TabsContent value="users">
            <motion.div
              initial={staggerChildren.initial}
              animate={staggerChildren.animate}
            >
              <UserManagement
                users={users}
                isLoading={usersLoading}
                onEditUser={handleEditUser}
                onAddUser={() => setAddUserDialogOpen(true)}
              />
            </motion.div>
          </TabsContent>

          {/* Tab 2: Roles & Permissions */}
          <TabsContent value="roles">
            <RoleManager
              roles={roles}
              isLoading={rolesLoading}
              onEditRole={handleEditRole}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new system user with role and module access
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onCancel={() => setAddUserDialogOpen(false)}
            onSave={() => {
              setAddUserDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['users'] });
              toast.success('User created successfully');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and access settings
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onCancel={() => setEditUserDialogOpen(false)}
            onSave={() => {
              setEditUserDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['users'] });
              toast.success('User updated successfully');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Permission Matrix Dialog */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole?.name} — Permissions
            </DialogTitle>
            <DialogDescription>
              Configure module permissions for this role
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <PermissionMatrix
              role={selectedRole}
              onSave={() => {
                setPermissionDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['roles'] });
                toast.success('Permissions updated successfully');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
