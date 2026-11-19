import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey);
