'use client';

// ============================================================
// FormWizard — Multi-step form with step indicator and animations
// ============================================================

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export interface FormStep {
  title: string;
  component: React.ReactNode;
  /** Validate function - return true if valid, false to block */
  validate?: () => boolean | Promise<boolean>;
}

export interface FormWizardProps {
  steps: FormStep[];
  onSubmit: () => Promise<void> | void;
  /** Is the form currently submitting */
  isLoading?: boolean;
  /** Submit button label */
  submitLabel?: string;
  /** Additional class */
  className?: string;
}

export default function FormWizard({
  steps,
  onSubmit,
  isLoading = false,
  submitLabel = 'Submit',
  className,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [validating, setValidating] = React.useState(false);
  const [direction, setDirection] = React.useState(1); // 1 = forward, -1 = backward

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = async () => {
    const step = steps[currentStep];
    if (step.validate) {
      setValidating(true);
      const isValid = await step.validate();
      setValidating(false);
      if (!isValid) return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const step = steps[currentStep];
    if (step.validate) {
      setValidating(true);
      const isValid = await step.validate();
      setValidating(false);
      if (!isValid) return;
    }
    await onSubmit();
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <React.Fragment key={idx}>
              {/* Step circle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (idx < currentStep) {
                      setDirection(-1);
                      setCurrentStep(idx);
                    }
                  }}
                  className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-colors shrink-0',
                    isCompleted && 'bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700',
                    isCurrent && 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2 ring-offset-background',
                    !isCompleted && !isCurrent && 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 cursor-default'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                </button>
                <span
                  className={cn(
                    'text-sm font-medium hidden sm:inline',
                    isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 min-w-[20px]',
                    idx < currentStep ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-stone-700'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content with slide animation */}
      <div className="relative overflow-hidden min-h-[200px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isFirst || isLoading || validating}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          {isLast ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || validating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Submitting...' : submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading || validating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {validating ? 'Validating...' : 'Next'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
