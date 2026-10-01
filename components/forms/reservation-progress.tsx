import { cn } from '@/lib/utils/cn';

const STEPS = ['Vos coordonnées', 'Votre projet', 'Récapitulatif'] as const;

export function ReservationProgress({ activeStep }: { activeStep: number }) {
  return (
    <nav aria-label="Étapes de réservation" className="mb-8 flex items-center gap-2">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isComplete = step < activeStep;
        const isActive = step === activeStep;

        return (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-2 last:flex-none">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isComplete
                    ? 'bg-canal-600 text-white'
                    : isActive
                      ? 'bg-ink-700 text-white'
                      : 'bg-ink-100 text-ink-400'
                )}
              >
                {step}
              </span>
              <span
                className={cn(
                  'hidden truncate text-sm font-medium lg:block',
                  isActive ? 'text-ink-900' : isComplete ? 'text-canal-700' : 'text-ink-400'
                )}
              >
                {label}
              </span>
            </div>
            {step < STEPS.length && <div className="h-px min-w-2 flex-1 bg-ink-100" />}
          </div>
        );
      })}
    </nav>
  );
}
