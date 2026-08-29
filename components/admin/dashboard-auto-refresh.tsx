'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export function DashboardAutoRefresh() {
  const router = useRouter();

  React.useEffect(() => {
    const refresh = () => router.refresh();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    const intervalId = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [router]);

  return null;
}
