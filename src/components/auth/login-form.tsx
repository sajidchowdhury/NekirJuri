'use client';

// ============================================================
// LoginForm — Login form with email, password, tenant slug,
// remember me, and forgot password link
// Uses react-hook-form + zod for validation
// Submits via next-auth signIn
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import GeometricDivider from '@/components/islamic/geometric-divider';

/** Login form schema */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantSlug: z.string().optional(),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/** Props for LoginForm */
export interface LoginFormProps {
  /** Optional className */
  className?: string;
}

/**
 * LoginForm renders a login form with email, password,
 * optional tenant slug, remember me checkbox, and links.
 */
export default function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      tenantSlug: '',
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        tenantSlug: data.tenantSlug || undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'Invalid email or password') {
          setAuthError('Invalid email or password. Please try again.');
        } else if (result.error === 'Access denied for this institution') {
          setAuthError('Access denied for this institution. Please check your institution slug.');
        } else {
          setAuthError(result.error);
        }
        return;
      }

      if (result?.ok) {
        toast.success('Welcome back!', {
          description: 'You have been logged in successfully.',
        });
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Auth error banner */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400"
            >
              {authError}
            </motion.div>
          )}

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@madrasha.com"
                    autoComplete="email"
                    className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="rounded-lg border-border pr-10 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tenant slug field (optional) */}
          <FormField
            control={form.control}
            name="tenantSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  Institution Slug
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="e.g., al-huda-madrasha"
                    autoComplete="off"
                    className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember me */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:border-emerald-600"
                  />
                </FormControl>
                <Label className="text-sm font-normal text-muted-foreground cursor-pointer">
                  Remember me for 30 days
                </Label>
              </FormItem>
            )}
          />

          {/* Divider */}
          <GeometricDivider color="muted" />

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white h-11 text-base font-medium shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
