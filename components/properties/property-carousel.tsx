'use client';

import * as React from 'react';
import { motion, useAnimationFrame, useInView, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Les cartes sont rendues côté serveur ; seul le déplacement est interactif. */
export function PropertyCarousel({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  const count = items.length;
  const viewport = React.useRef<HTMLDivElement>(null);
  const inView = useInView(viewport, { amount: 0.15 });
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const [geometry, setGeometry] = React.useState({ visible: 1, step: 0 });
  const x = useMotionValue(0);
  const [current, setCurrent] = React.useState(0);
  const [hidden, setHidden] = React.useState(false);
  const canMove = count > geometry.visible;

  React.useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => {
      const visible = Math.min(count, window.matchMedia('(min-width: 1024px)').matches ? 3 : window.matchMedia('(min-width: 640px)').matches ? 2 : 1);
      setGeometry({ visible, step: ((element.firstElementChild as HTMLElement).clientWidth + 24) / Math.max(visible, 1) });
      x.set(0);
      setCurrent(0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [count, x]);

  React.useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const navigate = (index: number) => {
    if (!canMove) return;
    const target = (index + count) % count;
    x.set(-target * geometry.step);
    setCurrent(target);
  };

  // Vitesse constante : une largeur de carte toutes les quatre secondes.
  // Le retour à zéro est visuellement identique grâce aux cartes dupliquées.
  useAnimationFrame((_, delta) => {
    if (!canMove || !geometry.step || !inView || reducedMotion || hidden) return;
    const length = count * geometry.step;
    const offset = ((-x.get() + Math.min(delta, 100) * geometry.step / 4000) % length + length) % length;
    x.set(-offset);
    const next = Math.floor(offset / geometry.step);
    if (next !== current) setCurrent(next);
  });

  if (!count) return null;
  const slides = canMove ? [...items, ...items.slice(0, geometry.visible + 1)] : items;

  return (
    <div role="region" aria-roledescription="carrousel" aria-label="Notre sélection de logements">
      <div ref={viewport} className="overflow-hidden px-1 py-6 -mx-1">
        <motion.div className="flex items-stretch gap-6" style={{ x }}>
          {slides.map((item, index) => {
            const visible = index >= current && index < current + geometry.visible + (canMove && !reducedMotion ? 1 : 0);
            return (
              <div key={index} role="group" aria-roledescription="diapositive"
                aria-label={`${index % count + 1} sur ${count}`} aria-hidden={!visible}
                ref={(element) => { if (element) element.toggleAttribute('inert', !visible); }}
                className="min-w-0 shrink-0 basis-full sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)]"
                style={!canMove ? { flexBasis: `calc((100% - ${(geometry.visible - 1) * 24}px) / ${Math.max(geometry.visible, 1)})` } : undefined}>
                {item}
              </div>
            );
          })}
        </motion.div>
      </div>
      {canMove && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Annonce précédente" onClick={() => navigate((current - 1 + count) % count)}><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="outline" size="icon" aria-label="Annonce suivante" onClick={() => navigate(current + 1)}><ChevronRight className="h-5 w-5" /></Button>
          </div>
          <div className="flex flex-wrap items-center gap-1" aria-label="Position dans la sélection">
            {items.map((_, index) => (
              <button key={index} type="button" aria-label={`Afficher l’annonce ${index + 1}`} aria-current={current === index ? 'true' : undefined}
                onClick={() => navigate(index)} className="flex h-11 w-7 items-center justify-center rounded-full">
                <span className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${current === index ? 'w-6 bg-canal-600' : 'w-1.5 bg-ink-200'}`} />
              </button>
            ))}
            <span className="ml-2 text-xs tabular-nums text-ink-500">{current + 1} / {count}</span>
          </div>
        </div>
      )}
    </div>
  );
}
