'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function CopyableField({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5',
        highlight ? 'border-brick-200 bg-brick-50' : 'border-ink-100 bg-sand-100/40'
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <p className={cn('break-all text-sm font-medium text-ink-800', mono && 'font-mono tracking-tight')}>
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        aria-label={`Copier ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white hover:text-ink-700"
      >
        {copied ? <Check className="h-4 w-4 text-canal-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
