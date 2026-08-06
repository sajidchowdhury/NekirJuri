'use client';

// ============================================================
// Login Page — Split layout with Islamic pattern + LoginForm
// Desktop: Left panel (pattern + branding) | Right panel (form)
// Mobile: Full-screen form with subtle pattern
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import CrescentLogo from '@/components/islamic/crescent-logo';
import AuthPattern from '@/components/auth/auth-pattern';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tApp = useTranslations('app');
  const tStats = useTranslations('auth.stats');

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
              {tApp('name')}
            </h1>
            <p className="text-emerald-100/80 text-lg max-w-xs mx-auto">
              {tApp('tagline')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 max-w-sm"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-emerald-100/60 mt-1">{tStats('institutions')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-xs text-emerald-100/60 mt-1">{tStats('students')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-xs text-emerald-100/60 mt-1">{tStats('uptime')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        {/* Mobile branding */}
        <div className="lg:hidden mb-8 text-center">
          <CrescentLogo size="md" className="mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">{tApp('name')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tApp('shortTagline')}
          </p>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              {t('title')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('subtitle')}
            </p>
          </motion.div>

          <LoginForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link
                href="/register"
                className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                {t('register')}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
