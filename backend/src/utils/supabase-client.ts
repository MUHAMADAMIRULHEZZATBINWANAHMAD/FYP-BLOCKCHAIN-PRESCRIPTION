//project id key: 3n0JLcIpBbxn6qgS
import { createClient } from '@supabase/supabase-js';



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

// bypasses RLS 
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});


export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

console.log(' Supabase clients initialized:');
console.log('   - Service role client: For backend operations (bypasses RLS)');
console.log('   - Anon key client: For user authentication (subject to RLS)');