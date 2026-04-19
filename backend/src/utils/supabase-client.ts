
import { createClient } from '@supabase/supabase-js';

//3n0JLcIpBbxn6qgS

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL in environment variables');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY in environment variables');
}

// ✅ Service role client (bypasses RLS, for backend operations)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// ✅ Anon key client (subject to RLS, for user auth operations)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

console.log('✅ Supabase clients initialized:');
console.log('   - Service role client: For backend operations (bypasses RLS)');
console.log('   - Anon key client: For user authentication (subject to RLS)');