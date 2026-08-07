// ============================================================
// POST /api/auth/register — Registration endpoint
// Creates tenant, user with hashed password, super admin role,
// and subscription. Returns success or validation errors.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/** Registration request schema */
const registerSchema = z.object({
  institutionName: z.string().min(2, 'Institution name is required'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  address: z.string().optional(),
  institutionType: z.enum(['madrasha', 'hifz', 'quran-academy', 'islamic-school']),
  adminName: z.string().min(2, 'Admin name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPhone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  planId: z.string().default('free'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { error: 'Validation failed', errors: fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check if slug is already taken
    const existingTenant = await db.tenant.findUnique({
      where: { slug: data.slug },
    });
    if (existingTenant) {
      return NextResponse.json(
        { error: 'This institution slug is already taken. Please choose another.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Determine plan — find or create subscription plan
    let plan = await db.subscriptionPlan.findFirst({
      where: { slug: data.planId },
    });

    if (!plan) {
      // Create default plans if none exist
      const planConfigs = [
        {
          slug: 'free',
          name: 'Free',
          description: 'Free plan for small institutions',
          priceMonthly: 0,
          maxStudents: 50,
          maxEmployees: 5,
          maxStorageMb: 100,
          features: ['basic_fees', 'student_management', 'attendance'],
        },
        {
          slug: 'standard',
          name: 'Standard',
          description: 'Standard plan for growing institutions',
          priceMonthly: 19,
          maxStudents: 500,
          maxEmployees: 50,
          maxStorageMb: 1024,
          features: ['basic_fees', 'student_management', 'attendance', 'salary', 'accounting', 'email_support'],
        },
        {
          slug: 'premium',
          name: 'Premium',
          description: 'Premium plan for large institutions',
          priceMonthly: 49,
          maxStudents: 10000,
          maxEmployees: 500,
          maxStorageMb: 10240,
          features: ['basic_fees', 'student_management', 'attendance', 'salary', 'accounting', 'email_support', 'priority_support', 'custom_branding', 'api_access', 'website'],
        },
      ];

      for (const config of planConfigs) {
        const created = await db.subscriptionPlan.create({
          data: config,
        });
        if (config.slug === data.planId) plan = created;
      }
    }

    // Create tenant + user + role in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.institutionName,
          slug: data.slug,
          address: data.address || null,
          settings: {
            institutionType: data.institutionType,
          },
        },
      });

      // 2. Create super admin user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.adminEmail,
          passwordHash,
          name: data.adminName,
          phone: data.adminPhone || null,
          isSuperAdmin: true,
          isActive: true,
        },
      });

      // 3. Create super admin role for this tenant
      const role = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Super Admin',
          slug: 'super-admin',
          description: 'Full access to all features',
          isSystem: true,
        },
      });

      // 4. Assign role to user
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      // 5. Create subscription if plan exists
      if (plan) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day trial
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const currentPeriodEnd = new Date(endDate); // Same as endDate for new subscription
        const gracePeriodEnd = new Date(endDate.getTime() + 14 * 24 * 60 * 60 * 1000); // endDate + 14 days

        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: 'trial',
            startDate: now,
            endDate,
            currentPeriodEnd,
            gracePeriodEnd,
            trialEnd,
            isAutoRenew: false,
          },
        });
      }

      return { tenant, user };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        tenantSlug: result.tenant.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
