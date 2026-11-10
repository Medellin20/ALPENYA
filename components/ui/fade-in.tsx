'use client';

import * as React from 'react';

// Le HTML reste visible sans JavaScript. Chaque apparition ne joue qu'une fois.
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (preference.matches || !element.animate) return;
      animation = element.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 700, delay: Math.min(Math.max(delay, 0), 0.3) * 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }
      );
    }, { threshold: 0.08 });
    const onPreferenceChange = () => {
      if (preference.matches) {
        animation?.cancel();
        observer.disconnect();
      }
    };
    if (!preference.matches) observer.observe(element);
    preference.addEventListener('change', onPreferenceChange);
    return () => {
      observer.disconnect();
      animation?.cancel();
      preference.removeEventListener('change', onPreferenceChange);
    };
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
}
