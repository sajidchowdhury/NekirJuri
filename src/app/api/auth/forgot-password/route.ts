// ============================================================
// POST /api/auth/forgot-password — Password reset request
// Finds user by email, generates reset token
// Always returns success (don't reveal if email exists)
// In production, send email with reset link
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

/** Forgot password request schema */
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user by email (non-deleted, active)
    const user = await db.user.findFirst({
      where: {
        email,
        deletedAt: null,
        isActive: true,
      },
    });

    // Always return success — don't reveal if email exists
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account exists with that email, a reset link has been sent.' }
      );
    }

    // Generate a reset token (using a random string)
    // In production, store this token and send email
    const resetToken = crypto.randomUUID();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in user's settings or a dedicated table
    // For now, we'll use the activity log to track the request
    if (user.tenantId) {
      await db.activityLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'user.password_reset_request',
          entityType: 'user',
          entityId: user.id,
          description: `Password reset requested for ${email}`,
          metadata: {
            resetToken,
            resetExpiry: resetExpiry.toISOString(),
          },
        },
      });
    }

    // TODO: In production, send email with reset link
    // await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { success: true, message: 'If an account exists with that email, a reset link has been sent.' }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return success to not reveal server errors
    return NextResponse.json(
      { success: true, message: 'If an account exists with that email, a reset link has been sent.' }
    );
  }
}
