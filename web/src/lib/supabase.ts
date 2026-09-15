/**
 * Supabase Client Initialization & Offline Resilience
 * Connects to Supabase when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.
 * Provides graceful fallback when running in pure offline / local-storage mode.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isCloudConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('...')
)

let client: SupabaseClient | null = null

if (isCloudConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

export const supabase = client
