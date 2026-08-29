'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { contactSchema, type ContactInput } from '@/lib/validations/contact';
import type { ActionResult } from '@/types';

export async function submitContactMessage(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Merci de corriger les champs indiqués.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { success: true, message: 'Votre message a été envoyé.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    return { success: false, message: 'Une erreur est survenue, merci de réessayer.' };
  }

  return { success: true, message: 'Votre message a été envoyé. Nous vous répondrons rapidement.' };
}
