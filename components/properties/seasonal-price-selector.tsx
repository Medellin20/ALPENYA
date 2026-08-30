'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils/format';

type Period = 'lowSeason' | 'holidays' | 'winter';

interface SeasonalPriceSelectorProps {
  lowSeasonPrice: number;
  holidayPrice: number;
  winterPrice: number;
  cleaningFee: number;
}

const PERIOD_LABELS: Record<Period, string> = {
  lowSeason: 'Hors saison',
  holidays: 'Noël et Nouvel An',
  winter: 'De janvier à mars',
};

export function SeasonalPriceSelector({
  lowSeasonPrice,
  holidayPrice,
  winterPrice,
  cleaningFee,
}: SeasonalPriceSelectorProps) {
  const [period, setPeriod] = useState<Period>('lowSeason');
  const prices: Record<Period, number> = {
    lowSeason: lowSeasonPrice,
    holidays: holidayPrice,
    winter: winterPrice,
  };
  const selectedPrice = prices[period];

  return (
    <div>
      <label htmlFor="rental-period" className="text-sm font-semibold text-ink-900">
        Choisissez votre période
      </label>
      <select
        id="rental-period"
        value={period}
        onChange={(event) => setPeriod(event.target.value as Period)}
        className="mt-2 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800 shadow-sm outline-none transition focus:border-canal-500 focus:ring-2 focus:ring-canal-200"
      >
        {Object.entries(PERIOD_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <div aria-live="polite" className="mt-4 rounded-xl bg-sand-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Tarif standard · {PERIOD_LABELS[period]}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-ink-900">
            {selectedPrice > 0 ? formatPrice(selectedPrice) : 'Nous consulter'}
          </span>
          {selectedPrice > 0 && <span className="text-sm text-ink-400">/ semaine</span>}
        </div>
        {cleaningFee > 0 && (
          <p className="mt-3 border-t border-ink-100 pt-3 text-sm text-ink-500">
            Forfait ménage : <strong className="font-bold text-ink-800">{formatPrice(cleaningFee)}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
