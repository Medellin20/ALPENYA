import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Client } from '@/types/database';

interface ClientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession?: string;
  monthlyIncome?: number;
}

/**
 * Crée le client s'il n'existe pas encore (déduplication par email), ou met
 * à jour ses coordonnées si un dossier existe déjà. Utilisé par les Server
 * Actions de demande de visite / réservation / contact.
 */
export async function upsertClient(input: ClientInput): Promise<Client> {
  const supabase = createAdminClient();
  const email = input.email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from('clients')
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        profession: input.profession ?? existing.profession,
        monthly_income: input.monthlyIncome ?? existing.monthly_income,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return updated as Client;
  }

  const { data: created, error } = await supabase
    .from('clients')
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email,
      phone: input.phone,
      profession: input.profession,
      monthly_income: input.monthlyIncome,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return created as Client;
}
