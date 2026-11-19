import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && (window as unknown as { ENV?: { SUPABASE_URL?: string } })?.ENV?.SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_KEY)) ||
  (typeof window !== 'undefined' && (window as unknown as { ENV?: { SUPABASE_ANON_KEY?: string } })?.ENV?.SUPABASE_ANON_KEY) ||
  '';

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
