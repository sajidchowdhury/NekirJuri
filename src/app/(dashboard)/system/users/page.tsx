'use client';

// ============================================================
// Users & Roles Page — Users tab + Roles & Permissions tab
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import UserManagement from '@/components/system/user-management';
import UserForm from '@/components/system/user-form';
import RoleManager from '@/components/system/role-manager';
import PermissionMatrix from '@/components/system/permission-matrix';
import { type SystemUser, type Role, sampleRoles } from '@/lib/system/sample-data';
import { fadeIn, slideUp, staggerChildren, transitions } from '@/lib/animations';

export default function UsersPage() {
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<SystemUser | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setPermissionDialogOpen(true);
  };

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
        showBismillah
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
                onEditUser={handleEditUser}
                onAddUser={() => setAddUserDialogOpen(true)}
              />
            </motion.div>
          </TabsContent>

          {/* Tab 2: Roles & Permissions */}
          <TabsContent value="roles">
            <RoleManager onEditRole={handleEditRole} />
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
            onSave={() => setAddUserDialogOpen(false)}
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
            onSave={() => setEditUserDialogOpen(false)}
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
              onSave={() => setPermissionDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
