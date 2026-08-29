import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const envText = await fs.readFile('.env.local', 'utf8');
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1)];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await supabase.from('properties')
  .select('id,slug,title,status,is_published,property_type,property_images(id),property_amenities(amenity_id)')
  .eq('slug', 'chalet-la-clusaz-haute-savoie')
  .single();
if (error) throw new Error(error.message);
console.log(JSON.stringify({
  title: data.title,
  slug: data.slug,
  type: data.property_type,
  status: data.status,
  published: data.is_published,
  images: data.property_images.length,
  amenities: data.property_amenities.length,
}, null, 2));
