'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { UploadCloud, Loader2 } from 'lucide-react';
import { declareGuaranteeTransfer } from '@/actions/guarantees';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ActionResult } from '@/types';

const initialState: ActionResult = { success: false, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      J’ai effectué le virement
    </Button>
  );
}

export function DeclareTransferForm({ guaranteePaymentId }: { guaranteePaymentId: string }) {
  const [state, formAction] = useFormState(declareGuaranteeTransfer, initialState);
  const [fileName, setFileName] = React.useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="guaranteePaymentId" value={guaranteePaymentId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="transferDate">Date du virement</Label>
          <Input id="transferDate" name="transferDate" type="date" required />
          <FieldError message={state.fieldErrors?.transferDate?.[0]} />
        </div>
        <div>
          <Label htmlFor="bankName">Banque émettrice</Label>
          <Input id="bankName" name="bankName" placeholder="Ex : ING, BNP Paribas..." required />
          <FieldError message={state.fieldErrors?.bankName?.[0]} />
        </div>
      </div>

      <div>
        <Label htmlFor="reference">Référence utilisée</Label>
        <Input id="reference" name="reference" placeholder="Ex : GUARANTEE-REN-000123" required />
        <FieldError message={state.fieldErrors?.reference?.[0]} />
      </div>

      <div>
        <Label htmlFor="proof">Justificatif de virement (facultatif)</Label>
        <label
          htmlFor="proof"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-sand-100/50 px-4 py-6 text-sm text-ink-500 transition-colors hover:border-ink-300 hover:bg-sand-100"
        >
          <UploadCloud className="h-4.5 w-4.5" />
          {fileName || 'PDF, JPG ou PNG — 8 Mo maximum'}
        </label>
        <input
          id="proof"
          name="proof"
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>

      {state.message && (
        <p className={`text-sm font-medium ${state.success ? 'text-canal-600' : 'text-brick-500'}`}>
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
