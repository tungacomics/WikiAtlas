import { createClient } from '@supabase/supabase-js';

// --- SUPABASE API CONFIGURATION ---

// 1. BASE URL: https://iyprctgzeycsgmgjfzun.supabase.co
// Used as the foundation for all REST, Auth, Realtime, and Storage requests.
const SUPABASE_URL = 'https://iyprctgzeycsgmgjfzun.supabase.co';

// 2. ANON KEY: Public safe key for frontend interactions.
// Passed in headers (apikey, Authorization) for all requests.
const SUPABASE_ANON_KEY = 'sb_publishable_q5k-HcxHgMQXPEXXy6Uncw_S_3Yv_XI';

// Initialize the Supabase Client
// This client automatically handles:
// - REST: https://iyprctgzeycsgmgjfzun.supabase.co/rest/v1 (CRUD)
// - Auth: https://iyprctgzeycsgmgjfzun.supabase.co/auth/v1 (Login/Signup)
// - Realtime: wss://iyprctgzeycsgmgjfzun.supabase.co/realtime/v1 (WebSockets)
// - Storage: https://iyprctgzeycsgmgjfzun.supabase.co/storage/v1 (File Uploads)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});