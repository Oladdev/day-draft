/**
 * Day Draft — Universal Supabase Credentials and Constants
 */

export const SUPABASE_URL = 'https://jceokvecelnxgajkihbo.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_Y3S5-l3YluOwIO9HiDSxbQ_Oa_4fUA-'

export const isCloudConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('placeholder')
)
