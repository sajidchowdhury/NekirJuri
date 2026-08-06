'use client';

// ============================================================
// Register Page — Split layout with Islamic pattern + RegisterForm
// Desktop: Left panel (pattern + branding) | Right panel (form)
// Mobile: Full-screen form with subtle pattern
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import CrescentLogo from '@/components/islamic/crescent-logo';
import AuthPattern from '@/components/auth/auth-pattern';
import RegisterForm from '@/components/auth/register-form';

export default function RegisterPage() {
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
              Start managing your institution with Islamic values at the core
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 max-w-sm"
          >
            <div className="space-y-4 text-sm text-emerald-100/70">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>Complete institution setup in 3 easy steps</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>14-day free trial on all plans</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>No credit card required to start</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — Register form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        {/* Mobile branding */}
        <div className="lg:hidden mb-8 text-center">
          <CrescentLogo size="md" className="mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">Madrasha ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create your institution account
          </p>
        </div>

        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              Create Account
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Set up your institution and admin account
            </p>
          </motion.div>

          <RegisterForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
