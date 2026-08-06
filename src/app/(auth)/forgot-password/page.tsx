'use client';

// ============================================================
// Forgot Password Page — Split layout with Islamic pattern + form
// Desktop: Left panel (pattern + branding) | Right panel (form)
// Mobile: Full-screen form with subtle pattern
// ============================================================

import { motion } from 'framer-motion';
import CrescentLogo from '@/components/islamic/crescent-logo';
import AuthPattern from '@/components/auth/auth-pattern';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen flex">
      {/* Left panel — Islamic pattern + branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <AuthPattern className="absolute inset-0" />

        {/* Branding content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <CrescentLogo size="lg" className="mx-auto mb-6 [&_*]:!fill-white dark:[&_*]:!fill-white" />
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Madrasha ERP
            </h1>
            <p className="text-emerald-100/80 text-lg max-w-xs mx-auto">
              Secure password recovery for your account
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — Forgot password form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        {/* Mobile branding */}
        <div className="lg:hidden mb-8 text-center">
          <CrescentLogo size="md" className="mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">Madrasha ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reset your password
          </p>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              Forgot Password?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              No worries, we&apos;ll help you reset it
            </p>
          </motion.div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
