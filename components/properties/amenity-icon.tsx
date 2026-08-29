import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function AmenityIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && (Icons as unknown as Record<string, LucideIcon>)[name]) || Icons.Sparkles;
  return <Icon className={className} />;
}
