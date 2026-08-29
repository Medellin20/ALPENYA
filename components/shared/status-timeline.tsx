import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface TimelineStep {
  label: string;
  state: 'done' | 'current' | 'upcoming' | 'failed';
}

export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <li key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                step.state === 'done' && 'bg-canal-600 text-white',
                step.state === 'current' && 'bg-ink-700 text-white ring-4 ring-ink-100',
                step.state === 'upcoming' && 'bg-ink-100 text-ink-400',
                step.state === 'failed' && 'bg-brick-500 text-white'
              )}
            >
              {step.state === 'done' && <Check className="h-3.5 w-3.5" />}
              {step.state === 'failed' && <X className="h-3.5 w-3.5" />}
              {(step.state === 'current' || step.state === 'upcoming') && i + 1}
            </span>
            {i < steps.length - 1 && (
              <span className={cn('mt-0.5 h-8 w-px flex-1', step.state === 'done' ? 'bg-canal-300' : 'bg-ink-100')} />
            )}
          </div>
          <div className={cn('pb-8 pt-0.5', i === steps.length - 1 && 'pb-0')}>
            <p
              className={cn(
                'text-sm font-semibold',
                step.state === 'upcoming' ? 'text-ink-400' : 'text-ink-900'
              )}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
