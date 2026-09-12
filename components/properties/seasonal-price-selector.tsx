'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/utils/format';

type ChaletPeriod = 'lowSeason' | 'holidays' | 'winter';
type VillaPeriod = 'summer' | 'earlySummer' | 'september' | 'lateSpring';

interface ChaletPriceSelectorProps {
  propertyType: 'chalet';
  lowSeasonPrice: number;
  holidayPrice: number;
  winterPrice: number;
  cleaningFee: number;
}

interface VillaPriceSelectorProps {
  propertyType: 'villa';
  summerPrice: number;
  earlySummerPrice: number;
  septemberPrice: number;
  lateSpringPrice: number;
}

type SeasonalPriceSelectorProps = ChaletPriceSelectorProps | VillaPriceSelectorProps;

const CHALET_PERIOD_LABELS: Record<ChaletPeriod, string> = {
  lowSeason: 'Hors saison',
  holidays: 'Noël et Nouvel An',
  winter: 'De janvier à mars',
};

const VILLA_PERIOD_LABELS: Record<VillaPeriod, string> = {
  summer: 'Juillet – août',
  earlySummer: 'Mi-juin – début juillet',
  september: 'Septembre',
  lateSpring: 'Mai – début juin',
};

export function SeasonalPriceSelector(props: SeasonalPriceSelectorProps) {
  if (props.propertyType === 'chalet') {
    return (
      <ChaletPriceSelector
        lowSeasonPrice={props.lowSeasonPrice}
        holidayPrice={props.holidayPrice}
        winterPrice={props.winterPrice}
        cleaningFee={props.cleaningFee}
      />
    );
  }

  return (
    <VillaPriceSelector
      summerPrice={props.summerPrice}
      earlySummerPrice={props.earlySummerPrice}
      septemberPrice={props.septemberPrice}
      lateSpringPrice={props.lateSpringPrice}
    />
  );
}

function ChaletPriceSelector({
  lowSeasonPrice,
  holidayPrice,
  winterPrice,
  cleaningFee,
}: Omit<ChaletPriceSelectorProps, 'propertyType'>) {
  const [period, setPeriod] = useState<ChaletPeriod>('lowSeason');
  const prices: Record<ChaletPeriod, number> = {
    lowSeason: lowSeasonPrice,
    holidays: holidayPrice,
    winter: winterPrice,
  };
  const selectedPrice = prices[period];

  return (
    <PriceSelectorLayout
      period={period}
      labels={CHALET_PERIOD_LABELS}
      selectedPrice={selectedPrice}
      onPeriodChange={(value) => setPeriod(value as ChaletPeriod)}
    >
      {cleaningFee > 0 && (
        <p className="mt-3 border-t border-ink-100 pt-3 text-sm text-ink-500">
          Forfait ménage : <strong className="font-bold text-ink-800">{formatPrice(cleaningFee)}</strong>
        </p>
      )}
    </PriceSelectorLayout>
  );
}

function VillaPriceSelector({
  summerPrice,
  earlySummerPrice,
  septemberPrice,
  lateSpringPrice,
}: Omit<VillaPriceSelectorProps, 'propertyType'>) {
  const [period, setPeriod] = useState<VillaPeriod>('summer');
  const prices: Record<VillaPeriod, number> = {
    summer: summerPrice,
    earlySummer: earlySummerPrice,
    september: septemberPrice,
    lateSpring: lateSpringPrice,
  };
  const selectedPrice = prices[period];

  return (
    <PriceSelectorLayout
      period={period}
      labels={VILLA_PERIOD_LABELS}
      selectedPrice={selectedPrice}
      onPeriodChange={(value) => setPeriod(value as VillaPeriod)}
    />
  );
}

function PriceSelectorLayout<T extends string>({
  period,
  labels,
  selectedPrice,
  onPeriodChange,
  children,
}: {
  period: T;
  labels: Record<T, string>;
  selectedPrice: number;
  onPeriodChange: (period: T) => void;
  children?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor="rental-period" className="text-sm font-semibold text-ink-900">
        Choisissez votre période
      </label>
      <select
        id="rental-period"
        value={period}
        onChange={(event) => onPeriodChange(event.target.value as T)}
        className="mt-2 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800 shadow-sm outline-none transition focus:border-canal-500 focus:ring-2 focus:ring-canal-200"
      >
        {Object.keys(labels).map((key) => {
          const value = key as T;
          return <option key={value} value={value}>{labels[value]}</option>;
        })}
      </select>

      <div aria-live="polite" className="mt-4 rounded-xl bg-sand-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Tarif standard · {labels[period]}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-ink-900">
            {selectedPrice > 0 ? formatPrice(selectedPrice) : 'Nous consulter'}
          </span>
          {selectedPrice > 0 && <span className="text-sm text-ink-400">/ semaine</span>}
        </div>
        {children}
      </div>
    </div>
  );
}
