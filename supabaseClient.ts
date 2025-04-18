import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://smbtuojsbjkaewxnebas.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_SECRET_KEY) {
  throw new Error('SUPABASE_SECRET_KEY is not defined in the environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
