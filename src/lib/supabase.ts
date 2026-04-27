import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const isConfigValid = 
  typeof supabaseUrl === 'string' && 
  supabaseUrl.startsWith('http') && 
  typeof supabaseAnonKey === 'string' && 
  supabaseAnonKey.length > 0;

if (!isConfigValid) {
  console.warn("Supabase credentials not found or invalid URL. App will fallback to localStorage.");
}

export const supabase = isConfigValid 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
