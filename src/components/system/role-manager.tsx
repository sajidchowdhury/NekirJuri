'use client';

// ============================================================
// RoleManager — Card grid of roles with permission summary
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Pencil, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type Role,
  sampleRoles,
  allPermissions,
} from '@/lib/system/sample-data';
import { slideUp, staggerChildren, transitions } from '@/lib/animations';

interface RoleManagerProps {
  onEditRole?: (role: Role) => void;
}

export default function RoleManager({ onEditRole }: RoleManagerProps) {
  const roles = sampleRoles;
  const totalPermissions = allPermissions.length;

  return (
    <motion.div
      initial={staggerChildren.initial}
      animate={staggerChildren.animate}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {roles.map((role) => {
        const permCount = role.permissions.length;
        return (
          <motion.div
            key={role.id}
            initial={slideUp.initial}
            animate={slideUp.animate}
            transition={transitions.normal}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                {/* Role header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{role.name}</h3>
                        {role.isSystem && (
                          <Badge className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-0 text-[10px] px-1.5">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{role.userCount} {role.userCount === 1 ? 'user' : 'users'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{permCount} of {totalPermissions} permissions</span>
                  </div>
                </div>

                {/* Permission bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Permission coverage</span>
                    <span>{Math.round((permCount / totalPermissions) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(permCount / totalPermissions) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Edit button */}
                <div className="pt-1">
                  {role.isSystem ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1.5 opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit Permissions
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>System role cannot be modified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                      onClick={() => onEditRole?.(role)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Permissions
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
