import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const rawEnv = await fs.readFile('.env.local', 'utf8');
const env = Object.fromEntries(rawEnv.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1)];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const slugs = ['appartement-centre-grand-bornand', 'chalet-megeve-mont-d-arbois', 'chalet-la-bresse-vosges'];
const { data, error } = await supabase
  .from('properties')
  .select('id,slug,title,monthly_price,deposit_amount,viewing_fee,service_charges,is_published,property_images(id)')
  .in('slug', slugs)
  .order('slug');
if (error) throw new Error(error.message);
console.log(JSON.stringify(data.map(({ property_images: images, ...property }) => ({ ...property, images: images.length })), null, 2));
