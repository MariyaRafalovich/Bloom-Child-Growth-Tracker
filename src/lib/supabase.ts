import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Normalize URL: If it's just a project ID, convert it to a full URL
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl.trim()}.supabase.co`;
}

const isConfigValid = 
  typeof supabaseUrl === 'string' && 
  supabaseUrl.startsWith('http') && 
  typeof supabaseAnonKey === 'string' && 
  supabaseAnonKey.length > 0;

if (!isConfigValid) {
  console.warn("Supabase credentials not found or invalid. App will fallback to localStorage.");
}

export const supabase = isConfigValid 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
