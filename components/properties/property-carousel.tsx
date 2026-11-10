'use client';

import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Les cartes sont rendues côté serveur ; seul le déplacement est interactif. */
export function PropertyCarousel({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  const count = items.length;
  const viewport = React.useRef<HTMLDivElement>(null);
  const inView = useInView(viewport, { amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const [geometry, setGeometry] = React.useState({ visible: 1, step: 0 });
  const [position, setPosition] = React.useState({ index: 0, instant: true });
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const moving = React.useRef(false);
  const canMove = count > geometry.visible;
  const current = count ? position.index % count : 0;

  React.useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => {
      const visible = Math.min(count, window.matchMedia('(min-width: 1024px)').matches ? 3 : window.matchMedia('(min-width: 640px)').matches ? 2 : 1);
      setGeometry({ visible, step: ((element.firstElementChild as HTMLElement).clientWidth + 24) / Math.max(visible, 1) });
      setPosition({ index: 0, instant: true });
      moving.current = false;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [count]);

  React.useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const navigate = React.useCallback((index: number) => {
    if (moving.current || !canMove || index % count === current) return;
    moving.current = !reducedMotion;
    setPosition({ index, instant: false });
  }, [canMove, reducedMotion, count, current]);

  React.useEffect(() => {
    if (!canMove || !inView || reducedMotion || hovered || focused || paused || hidden) return;
    const timer = window.setInterval(() => navigate(current + 1), 4000);
    return () => window.clearInterval(timer);
  }, [canMove, inView, reducedMotion, hovered, focused, paused, hidden, current, navigate]);

  if (!count) return null;
  const slides = canMove ? [...items, ...items.slice(0, geometry.visible)] : items;

  return (
    <div role="region" aria-roledescription="carrousel" aria-label="Notre sélection de logements"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}>
      <div ref={viewport} className="overflow-hidden px-1 py-6 -mx-1">
        <motion.div className="flex items-stretch gap-6"
          initial={false} animate={{ x: -position.index * geometry.step }}
          transition={{ duration: reducedMotion || position.instant ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => {
            moving.current = false;
            if (position.index >= count) setPosition({ index: 0, instant: true });
          }}>
          {slides.map((item, index) => {
            const visible = index >= position.index && index < position.index + geometry.visible;
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
            <Button variant="ghost" size="icon" className="motion-reduce:hidden" aria-label={paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'} onClick={() => setPaused(value => !value)}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
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
