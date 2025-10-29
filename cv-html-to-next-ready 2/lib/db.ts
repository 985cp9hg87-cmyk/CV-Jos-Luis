import { createClient } from "@supabase/supabase-js";
export function getSupabase(){
  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
  const anon = process.env.SUPABASE_ANON_KEY;
  if(url && (serviceRole || anon)){
    const key = serviceRole || anon!;
    return createClient(url, key, { auth: { persistSession:false } });
  }
  return null;
}