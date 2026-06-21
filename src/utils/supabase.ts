import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSessionId() {
  if (typeof window === 'undefined') return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session.user.id;
}

export async function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session.access_token;
}
