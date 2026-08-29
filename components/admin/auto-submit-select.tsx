'use client';

import * as React from 'react';
import { Select } from '@/components/ui/select';

export function AutoSubmitSelect({
  name,
  defaultValue,
  children,
  className,
}: {
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue ?? ''}
      className={className}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {children}
    </Select>
  );
}
