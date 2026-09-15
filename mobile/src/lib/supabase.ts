import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://jceokvecelnxgajkihbo.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_Y3S5-l3YluOwIO9HiDSxbQ_Oa_4fUA-'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const isCloudConfigured = true
