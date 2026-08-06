'use client'

// ============================================================
// BillingPage — Full subscription/billing management page
// Contains: Current Plan, Plan Comparison, Payment History,
// Make Payment, and Subscription Timeline sections
// ============================================================

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Check, Crown, Zap, Building2, Star,
  ArrowUpRight, ExternalLink, Phone, Receipt,
  Calendar, Clock, CircleCheck, CircleX, AlertCircle,
  Loader2, Shield, Users, HardDrive, GraduationCap,
  ChevronRight, Info, Send, Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBDT, type BillingDuration, type PaymentMethod } from '@/lib/subscription'
import { fadeIn, slideUp, staggerChildren, transitions } from '@/lib/animations'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// -----------------------------------------------------------
// Sample Data (for dev/preview mode)
// -----------------------------------------------------------

interface PlanData {
  slug: string
  name: string
  priceMonthly: number
  price6Monthly: number
  priceYearly: number
  maxStudents: number
  maxEmployees: number
  maxStorageMb: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const PLANS: PlanData[] = [
  {
    slug: 'free',
    name: 'Free',
    priceMonthly: 0,
    price6Monthly: 0,
    priceYearly: 0,
    maxStudents: 50,
    maxEmployees: 5,
    maxStorageMb: 100,
    features: ['Up to 50 students', '5 employees', '100 MB storage', 'Basic reports', 'Single branch'],
    icon: <Zap className="size-5" />,
  },
  {
    slug: 'basic',
    name: 'Basic',
    priceMonthly: 2999,
    price6Monthly: 15999,
    priceYearly: 29999,
    maxStudents: 500,
    maxEmployees: 25,
    maxStorageMb: 2048,
    features: ['Up to 500 students', '25 employees', '2 GB storage', 'Fee management', 'Collections & receipts', 'Basic reports', 'Single branch'],
    icon: <Star className="size-5" />,
  },
  {
    slug: 'professional',
    name: 'Professional',
    priceMonthly: 7999,
    price6Monthly: 42999,
    priceYearly: 79999,
    maxStudents: 2000,
    maxEmployees: 100,
    maxStorageMb: 10240,
    features: ['Up to 2,000 students', '100 employees', '10 GB storage', 'Full academic management', 'Finance & payroll', 'Inventory management', 'Website & notices', 'Advanced reports', 'Multi-branch support'],
    popular: true,
    icon: <Crown className="size-5" />,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 19999,
    price6Monthly: 109999,
    priceYearly: 199999,
    maxStudents: 10000,
    maxEmployees: 500,
    maxStorageMb: 51200,
    features: ['Up to 10,000 students', '500 employees', '50 GB storage', 'Everything in Professional', 'Custom integrations', 'API access', 'Priority support', 'Dedicated account manager', 'Custom branding', 'SLA guarantee'],
    icon: <Building2 className="size-5" />,
  },
]

interface PaymentRecord {
  id: string
  date: string
  amount: number
  method: PaymentMethod
  transactionRef: string
  status: 'verified' | 'pending' | 'failed' | 'refunded'
  duration: BillingDuration
}

const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    date: '2025-07-15',
    amount: 79999,
    method: 'bkash',
    transactionRef: 'BKASH8A4X9M2',
    status: 'verified',
    duration: 12,
  },
  {
    id: 'pay-2',
    date: '2025-04-10',
    amount: 42999,
    method: 'nagad',
    transactionRef: 'NGD7B2K5P1',
    status: 'verified',
    duration: 6,
  },
  {
    id: 'pay-3',
    date: '2025-01-05',
    amount: 7999,
    method: 'bank',
    transactionRef: 'TT-20250105-7890',
    status: 'pending',
    duration: 1,
  },
]

interface TimelineEvent {
  date: string
  event: string
  description: string
  icon: React.ReactNode
}

const SAMPLE_TIMELINE: TimelineEvent[] = [
  {
    date: '2024-12-15',
    event: 'Account Created',
    description: 'Institution registered with 14-day trial',
    icon: <CircleCheck className="size-4 text-emerald-500" />,
  },
  {
    date: '2024-12-29',
    event: 'Trial Ended',
    description: 'Trial period expired',
    icon: <Clock className="size-4 text-amber-500" />,
  },
  {
    date: '2025-01-05',
    event: 'Subscribed to Professional',
    description: 'Monthly plan activated via bank transfer',
    icon: <CreditCard className="size-4 text-emerald-500" />,
  },
  {
    date: '2025-04-10',
    event: 'Renewed — 6 Months',
    description: 'Switched to 6-month plan via Nagad',
    icon: <ArrowUpRight className="size-4 text-emerald-500" />,
  },
  {
    date: '2025-07-15',
    event: 'Renewed — 12 Months',
    description: 'Annual plan via bKash',
    icon: <ArrowUpRight className="size-4 text-emerald-500" />,
  },
]

// Current subscription sample
const CURRENT_SUBSCRIPTION = {
  planSlug: 'professional',
  planName: 'Professional',
  status: 'active' as const,
  startDate: '2025-07-15',
  endDate: '2026-07-15',
  duration: 12 as BillingDuration,
  daysRemaining: 23,
  usedStudents: 450,
  usedEmployees: 28,
  usedStorageMb: 3276.8, // 3.2 GB
}

// -----------------------------------------------------------
// Helper: Payment status badge
// -----------------------------------------------------------

function PaymentStatusBadge({ status }: { status: PaymentRecord['status'] }) {
  const config: Record<string, { label: string; className: string }> = {
    verified: { label: 'Verified', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    pending: { label: 'Pending', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    failed: { label: 'Failed', className: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
    refunded: { label: 'Refunded', className: 'bg-stone-100 dark:bg-stone-800/30 text-stone-600 dark:text-stone-400' },
  }
  const c = config[status] ?? config.pending
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', c.className)}>
      {status === 'verified' && <CircleCheck className="size-3" />}
      {status === 'pending' && <Clock className="size-3" />}
      {status === 'failed' && <CircleX className="size-3" />}
      {status === 'refunded' && <AlertCircle className="size-3" />}
      {c.label}
    </span>
  )
}

// -----------------------------------------------------------
// Helper: Payment method label
// -----------------------------------------------------------

function PaymentMethodLabel({ method }: { method: PaymentMethod }) {
  const config: Record<string, { label: string; className: string }> = {
    bkash: { label: 'bKash', className: 'text-pink-600 dark:text-pink-400' },
    nagad: { label: 'Nagad', className: 'text-orange-600 dark:text-orange-400' },
    bank: { label: 'Bank Transfer', className: 'text-sky-600 dark:text-sky-400' },
    manual: { label: 'Manual', className: 'text-stone-600 dark:text-stone-400' },
  }
  const c = config[method] ?? config.manual
  return <span className={cn('text-sm font-medium', c.className)}>{c.label}</span>
}

// -----------------------------------------------------------
// Section 1: Current Plan
// -----------------------------------------------------------

function CurrentPlanSection() {
  const plan = PLANS.find(p => p.slug === CURRENT_SUBSCRIPTION.planSlug)!
  const studentPct = Math.round((CURRENT_SUBSCRIPTION.usedStudents / plan.maxStudents) * 100)
  const employeePct = Math.round((CURRENT_SUBSCRIPTION.usedEmployees / plan.maxEmployees) * 100)
  const storagePct = Math.round((CURRENT_SUBSCRIPTION.usedStorageMb / plan.maxStorageMb) * 100)

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    trial: { label: 'Trial', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    grace_period: { label: 'Grace Period', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    restricted: { label: 'Restricted', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
    suspended: { label: 'Suspended', className: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
    terminated: { label: 'Terminated', className: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
  }
  const sc = statusConfig[CURRENT_SUBSCRIPTION.status] ?? statusConfig.active

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5 text-emerald-600 dark:text-emerald-400" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription and resource usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan info row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold text-foreground">{CURRENT_SUBSCRIPTION.planName}</span>
              <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                <CircleCheck className="size-3" />
                {sc.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>{CURRENT_SUBSCRIPTION.duration}-month plan</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>{CURRENT_SUBSCRIPTION.daysRemaining} days left</span>
              </div>
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{CURRENT_SUBSCRIPTION.startDate}</span>
            <ChevronRight className="size-3.5" />
            <span>{CURRENT_SUBSCRIPTION.endDate}</span>
          </div>

          <Separator />

          {/* Usage bars */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Resource Usage</h4>

            {/* Students */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GraduationCap className="size-3.5" />
                  <span>Students</span>
                </div>
                <span className="font-medium text-foreground">
                  {CURRENT_SUBSCRIPTION.usedStudents.toLocaleString()} / {plan.maxStudents.toLocaleString()}
                </span>
              </div>
              <Progress value={studentPct} className={cn(
                'h-2',
                studentPct > 80 && '[&>[data-slot=progress-indicator]]:bg-amber-500',
                studentPct > 95 && '[&>[data-slot=progress-indicator]]:bg-rose-500',
              )} />
            </div>

            {/* Employees */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-3.5" />
                  <span>Employees</span>
                </div>
                <span className="font-medium text-foreground">
                  {CURRENT_SUBSCRIPTION.usedEmployees} / {plan.maxEmployees}
                </span>
              </div>
              <Progress value={employeePct} className={cn(
                'h-2',
                employeePct > 80 && '[&>[data-slot=progress-indicator]]:bg-amber-500',
                employeePct > 95 && '[&>[data-slot=progress-indicator]]:bg-rose-500',
              )} />
            </div>

            {/* Storage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <HardDrive className="size-3.5" />
                  <span>Storage</span>
                </div>
                <span className="font-medium text-foreground">
                  {(CURRENT_SUBSCRIPTION.usedStorageMb / 1024).toFixed(1)} GB / {(plan.maxStorageMb / 1024).toFixed(0)} GB
                </span>
              </div>
              <Progress value={storagePct} className={cn(
                'h-2',
                storagePct > 80 && '[&>[data-slot=progress-indicator]]:bg-amber-500',
                storagePct > 95 && '[&>[data-slot=progress-indicator]]:bg-rose-500',
              )} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href="/system/billing">
              <CreditCard className="size-3.5" />
              Renew Subscription
            </Link>
          </Button>
          {CURRENT_SUBSCRIPTION.planSlug !== 'enterprise' && (
            <Button size="sm" className="gap-1.5" asChild>
              <Link href="/system/billing">
                <ArrowUpRight className="size-3.5" />
                Upgrade Plan
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// -----------------------------------------------------------
// Section 2: Plan Comparison & Upgrade
// -----------------------------------------------------------

function PlanComparisonSection() {
  const [duration, setDuration] = React.useState<BillingDuration>(1)

  const getPrice = (plan: PlanData): number => {
    if (duration === 1) return plan.priceMonthly
    if (duration === 6) return plan.price6Monthly
    return plan.priceYearly
  }

  const getPerMonth = (plan: PlanData): number => {
    return Math.round(getPrice(plan) / duration)
  }

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-amber-500" />
            Plans & Pricing
          </CardTitle>
          <CardDescription>Choose the plan that fits your institution</CardDescription>
          <CardAction>
            {/* Duration selector */}
            <div className="flex items-center gap-1">
              {([1, 6, 12] as BillingDuration[]).map((d) => (
                <Button
                  key={d}
                  variant={duration === d ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setDuration(d)}
                >
                  {d === 1 ? 'Monthly' : d === 6 ? '6 Months' : 'Annual'}
                  {d === 12 && (
                    <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      Save 17%
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.slug === CURRENT_SUBSCRIPTION.planSlug
              const price = getPrice(plan)
              const perMonth = getPerMonth(plan)

              return (
                <motion.div
                  key={plan.slug}
                  initial={fadeIn.initial}
                  animate={fadeIn.animate}
                  transition={transitions.normal}
                >
                  <Card className={cn(
                    'relative overflow-hidden',
                    isCurrent && 'ring-2 ring-emerald-500 dark:ring-emerald-400',
                    plan.popular && !isCurrent && 'ring-1 ring-amber-300 dark:ring-amber-700',
                  )}>
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                        POPULAR
                      </div>
                    )}

                    <CardContent className="pt-5 space-y-4">
                      {/* Plan icon + name */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'flex items-center justify-center size-9 rounded-lg',
                          plan.slug === 'free' && 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
                          plan.slug === 'basic' && 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
                          plan.slug === 'professional' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                          plan.slug === 'enterprise' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                        )}>
                          {plan.icon}
                        </div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      </div>

                      {/* Price */}
                      <div className="space-y-0.5">
                        <div className="text-2xl font-bold text-foreground">
                          {price === 0 ? 'Free' : formatBDT(price)}
                        </div>
                        {price > 0 && duration > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {formatBDT(perMonth)}/month
                          </p>
                        )}
                        {price === 0 && (
                          <p className="text-xs text-muted-foreground">Forever free</p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-1.5 text-sm">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                            <Check className="size-3.5 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      {isCurrent ? (
                        <Button variant="outline" size="sm" className="w-full gap-1.5" disabled>
                          <CircleCheck className="size-3.5" />
                          Current Plan
                        </Button>
                      ) : plan.slug === 'free' ? (
                        <Button variant="outline" size="sm" className="w-full gap-1.5">
                          Downgrade
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full gap-1.5">
                          <ArrowUpRight className="size-3.5" />
                          Upgrade
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// -----------------------------------------------------------
// Section 3: Payment History
// -----------------------------------------------------------

function PaymentHistorySection() {
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-emerald-600 dark:text-emerald-400" />
            Payment History
          </CardTitle>
          <CardDescription>Track all your past payments and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop: Table view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_PAYMENTS.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">{payment.date}</TableCell>
                    <TableCell className="text-sm font-medium">{formatBDT(payment.amount)}</TableCell>
                    <TableCell><PaymentMethodLabel method={payment.method} /></TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{payment.transactionRef}</TableCell>
                    <TableCell className="text-sm">
                      {payment.duration === 1 ? '1 Month' : payment.duration === 6 ? '6 Months' : '12 Months'}
                    </TableCell>
                    <TableCell><PaymentStatusBadge status={payment.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Card view */}
          <div className="md:hidden space-y-3">
            {SAMPLE_PAYMENTS.map((payment) => (
              <div key={payment.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatBDT(payment.amount)}</span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{payment.date}</span>
                  <PaymentMethodLabel method={payment.method} />
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Ref: {payment.transactionRef}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// -----------------------------------------------------------
// Section 4: Make Payment
// -----------------------------------------------------------

function MakePaymentSection() {
  const [method, setMethod] = React.useState<PaymentMethod>('bkash')
  const [phone, setPhone] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [selectedPlan, setSelectedPlan] = React.useState('professional')
  const [selectedDuration, setSelectedDuration] = React.useState<BillingDuration>(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const plan = PLANS.find(p => p.slug === selectedPlan)!
  const calculatedAmount = plan.priceMonthly
  // Use proper price calculation based on duration
  const finalAmount = selectedDuration === 1 ? plan.priceMonthly
    : selectedDuration === 6 ? plan.price6Monthly
    : plan.priceYearly

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    setIsSubmitting(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const methodConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    bkash: {
      label: 'bKash',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800',
      icon: <Smartphone className="size-4" />,
    },
    nagad: {
      label: 'Nagad',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
      icon: <Smartphone className="size-4" />,
    },
    bank: {
      label: 'Bank Transfer',
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800',
      icon: <Building2 className="size-4" />,
    },
    manual: {
      label: 'Manual Payment',
      color: 'text-stone-600 dark:text-stone-400',
      bgColor: 'bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700',
      icon: <Shield className="size-4" />,
    },
  }

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5 text-emerald-600 dark:text-emerald-400" />
            Make Payment
          </CardTitle>
          <CardDescription>Choose a payment method and complete your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan & Duration Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.filter(p => p.slug !== 'free').map(p => (
                    <SelectItem key={p.slug} value={p.slug}>{p.name} — {formatBDT(p.priceMonthly)}/mo</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={String(selectedDuration)} onValueChange={(v) => setSelectedDuration(Number(v) as BillingDuration)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month — {formatBDT(plan.priceMonthly)}</SelectItem>
                  <SelectItem value="6">6 Months — {formatBDT(plan.price6Monthly)}</SelectItem>
                  <SelectItem value="12">12 Months — {formatBDT(plan.priceYearly)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Display */}
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatBDT(finalAmount)}</p>
            {selectedDuration > 1 && (
              <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                {formatBDT(Math.round(finalAmount / selectedDuration))}/month
              </p>
            )}
          </div>

          <Separator />

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(methodConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setMethod(key as PaymentMethod)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-all',
                    method === key
                      ? config.bgColor + ' ' + config.color + ' ring-2 ring-current/20'
                      : 'border-border hover:border-current/20 text-muted-foreground',
                  )}
                >
                  {config.icon}
                  <span className="font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone number for bKash/Nagad */}
          {(method === 'bkash' || method === 'nagad') && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {method === 'bkash' ? 'bKash' : 'Nagad'} Phone Number
              </Label>
              <Input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                You will receive a payment prompt on your {method === 'bkash' ? 'bKash' : 'Nagad'} account.
              </p>
            </div>
          )}

          {/* Bank transfer info */}
          {method === 'bank' && (
            <div className="rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 p-4 space-y-2">
              <h4 className="text-sm font-medium text-sky-700 dark:text-sky-400">Bank Transfer Details</h4>
              <div className="text-xs text-sky-600 dark:text-sky-400 space-y-1">
                <p>Bank: Dutch-Bangla Bank Ltd.</p>
                <p>Account Name: Madrasha ERP Solutions</p>
                <p>Account No: 123.456.7890</p>
                <p>Branch: Dhaka Main</p>
                <p>Routing No: 1234567</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                After transferring, enter the transaction reference below.
              </p>
              <div className="space-y-2 mt-3">
                <Label>Transaction Reference</Label>
                <Input placeholder="TT-XXXXXXXX-XXXX" className="max-w-xs" />
              </div>
            </div>
          )}

          {/* Manual payment info */}
          {method === 'manual' && (
            <div className="rounded-lg bg-stone-50 dark:bg-stone-800/30 border border-stone-200 dark:border-stone-700 p-4 space-y-2">
              <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300">Manual Payment</h4>
              <p className="text-xs text-muted-foreground">
                Contact our sales team for manual payment processing. You can pay via cash, cheque, or direct bank deposit at our office.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="size-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+880 1XXX-XXXXXX</span>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (method === 'bkash' || method === 'nagad' ? !phone : false)}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit Payment
                </>
              )}
            </Button>

            {/* Pending payment indicator */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
                >
                  <Clock className="size-4" />
                  Payment submitted — pending verification
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// -----------------------------------------------------------
// Section 5: Subscription Timeline
// -----------------------------------------------------------

function SubscriptionTimelineSection() {
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
            Subscription Timeline
          </CardTitle>
          <CardDescription>History of your subscription events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            {SAMPLE_TIMELINE.map((event, index) => (
              <motion.div
                key={index}
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...transitions.normal, delay: index * 0.08 }}
                className="relative flex items-start gap-4 pb-6 last:pb-0"
              >
                {/* Icon dot */}
                <div className="relative z-10 flex items-center justify-center size-6 rounded-full bg-background border border-border shrink-0">
                  {event.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className="text-sm font-medium text-foreground">{event.event}</h4>
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// -----------------------------------------------------------
// Main BillingPage Component
// -----------------------------------------------------------

export default function BillingPage() {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      {/* Section 1: Current Plan */}
      <CurrentPlanSection />

      {/* Section 2: Plan Comparison & Upgrade */}
      <PlanComparisonSection />

      {/* Sections 3-5 in tabs for better organization */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments" className="gap-1.5">
            <Receipt className="size-3.5" />
            Payment History
          </TabsTrigger>
          <TabsTrigger value="make-payment" className="gap-1.5">
            <Send className="size-3.5" />
            Make Payment
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <Clock className="size-3.5" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <PaymentHistorySection />
        </TabsContent>

        <TabsContent value="make-payment">
          <MakePaymentSection />
        </TabsContent>

        <TabsContent value="timeline">
          <SubscriptionTimelineSection />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export { BillingPage }
