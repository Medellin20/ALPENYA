import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const text = await fs.readFile('.env.local', 'utf8');
const env = Object.fromEntries(text.split(/\r?\n/).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1)];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await supabase.from('properties').update({
  monthly_price: 1806,
  deposit_amount: 2156,
  viewing_fee: 2338,
  service_charges: 150,
}).eq('slug', 'chalet-la-clusaz-haute-savoie').select('slug,monthly_price,deposit_amount,viewing_fee,service_charges').single();
if (error) throw new Error(error.message);
console.log(JSON.stringify(data));
