'use client';

// ============================================================
// RegisterForm — Multi-step registration form
// Step 1: Tenant Info (institution name, slug, address, type)
// Step 2: Admin User (name, email, phone, password, confirm)
// Step 3: Subscription Plan Selection
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SubscriptionPlanCard from '@/components/auth/subscription-plan-card';

// ============================================================
// Schemas
// ============================================================

const tenantSchema = z.object({
  institutionName: z.string().min(2, 'Institution name is required (min 2 characters)'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  address: z.string().optional(),
  institutionType: z.enum(['madrasha', 'hifz', 'quran-academy', 'islamic-school'], {
    required_error: 'Please select an institution type',
  }),
});

const adminSchema = z
  .object({
    adminName: z.string().min(2, 'Name is required (min 2 characters)'),
    adminEmail: z.string().email('Please enter a valid email address'),
    adminPhone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type TenantFormValues = z.infer<typeof tenantSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

// ============================================================
// Plans data
// ============================================================

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0/mo',
    features: [
      'Up to 50 students',
      '1 branch',
      'Basic fee management',
      'Community support',
    ],
    isRecommended: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$19/mo',
    features: [
      'Up to 500 students',
      '5 branches',
      'Full fee & salary management',
      'Accounting module',
      'Email support',
    ],
    isRecommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$49/mo',
    features: [
      'Unlimited students',
      'Unlimited branches',
      'All modules included',
      'Priority support',
      'Custom branding',
      'API access',
    ],
    isRecommended: false,
  },
];

// ============================================================
// Stepper indicator
// ============================================================

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['Institution', 'Admin', 'Plan'];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center size-8 rounded-full text-xs font-bold transition-all duration-300 ${
              i + 1 === currentStep
                ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-md'
                : i + 1 < currentStep
                  ? 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1 < currentStep ? (
              <Check className="size-4" />
            ) : (
              i + 1
            )}
          </div>
          <span
            className={`text-xs font-medium hidden sm:inline ${
              i + 1 === currentStep
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-muted-foreground'
            }`}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 rounded transition-colors duration-300 ${
                i + 1 < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// RegisterForm component
// ============================================================

export interface RegisterFormProps {
  className?: string;
}

export default function RegisterForm({ className }: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('standard');

  // Step 1 form
  const tenantForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      institutionName: '',
      slug: '',
      address: '',
      institutionType: undefined,
    },
  });

  // Step 2 form
  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Auto-generate slug from institution name
  const handleInstitutionNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    tenantForm.setValue('slug', slug);
  };

  // Step navigation
  function goNext() {
    if (step === 1) {
      tenantForm.handleSubmit(() => setStep(2))();
    } else if (step === 2) {
      adminForm.handleSubmit(() => setStep(3))();
    }
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  // Final submit
  async function handleRegister() {
    const tenantData = tenantForm.getValues();
    const adminData = adminForm.getValues();

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName: tenantData.institutionName,
          slug: tenantData.slug,
          address: tenantData.address,
          institutionType: tenantData.institutionType,
          adminName: adminData.adminName,
          adminEmail: adminData.adminEmail,
          adminPhone: adminData.adminPhone,
          password: adminData.password,
          planId: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          // Show validation errors from server
          const firstError = Object.values(data.errors)[0];
          toast.error('Validation Error', {
            description: Array.isArray(firstError) ? firstError[0] : String(firstError),
          });
        } else {
          toast.error('Registration Failed', {
            description: data.error || 'Something went wrong. Please try again.',
          });
        }
        return;
      }

      toast.success('Account Created!', {
        description: 'Your institution has been registered. Please sign in.',
        duration: 5000,
      });

      router.push('/login');
    } catch {
      toast.error('Network Error', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Animation variants for step transitions
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div className={className}>
      <StepIndicator currentStep={step} />

      <AnimatePresence mode="wait" custom={1}>
        {/* Step 1: Tenant Info */}
        {step === 1 && (
          <motion.div
            key="step-1"
            custom={1}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Form {...tenantForm}>
              <form className="space-y-5">
                <FormField
                  control={tenantForm.control}
                  name="institutionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Al-Huda Madrasha"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleInstitutionNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={tenantForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Institution Slug
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (auto-generated, editable)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="al-huda-madrasha"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={tenantForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Islamic Street, Dhaka"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={tenantForm.control}
                  name="institutionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg border-border focus-visible:ring-emerald-500/50 w-full">
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="madrasha">Madrasha</SelectItem>
                          <SelectItem value="hifz">Hifz Program</SelectItem>
                          <SelectItem value="quran-academy">Quran Academy</SelectItem>
                          <SelectItem value="islamic-school">Islamic School</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </motion.div>
        )}

        {/* Step 2: Admin User */}
        {step === 2 && (
          <motion.div
            key="step-2"
            custom={1}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Form {...adminForm}>
              <form className="space-y-5">
                <FormField
                  control={adminForm.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Abdullah Ahmed"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adminForm.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
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

                <FormField
                  control={adminForm.control}
                  name="adminPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+880 1XXX-XXXXXX"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min 8 chars, 1 uppercase, 1 number"
                          autoComplete="new-password"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adminForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          className="rounded-lg border-border focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </motion.div>
        )}

        {/* Step 3: Subscription Plan */}
        {step === 3 && (
          <motion.div
            key="step-3"
            custom={1}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  planId={plan.id}
                  name={plan.name}
                  price={plan.price}
                  features={plan.features}
                  isRecommended={plan.isRecommended}
                  isSelected={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="rounded-lg"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleRegister}
            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white h-10 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
