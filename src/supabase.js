import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===== TRAINING INQUIRIES =====
export const inquiries = {
  create: async (data) => {
    const { data: result, error } = await supabase
      .from('training_inquiries')
      .insert([data])
      .select()
    return { data: result, error }
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('training_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from('training_inquiries')
      .update({ ...data, updated_at: new Date() })
      .eq('id', id)
      .select()
    return { data: result, error }
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('training_inquiries')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// ===== USER PROFILES =====
export const profiles = {
  create: async (userId, data) => {
    const { data: result, error } = await supabase
      .from('user_profiles')
      .insert([{ user_id: userId, ...data }])
      .select()
    return { data: result, error }
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  update: async (userId, data) => {
    const { data: result, error } = await supabase
      .from('user_profiles')
      .update({ ...data, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
    return { data: result, error }
  },

  delete: async (userId) => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)
    return { error }
  }
}

// ===== TRAINING PLANS =====
export const plans = {
  create: async (userId, data) => {
    const { data: result, error } = await supabase
      .from('training_plans')
      .insert([{ user_id: userId, ...data }])
      .select()
    return { data: result, error }
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getById: async (planId) => {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', planId)
      .single()
    return { data, error }
  },

  delete: async (planId) => {
    const { error } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', planId)
    return { error }
  }
}

// ===== BOOKINGS =====
export const bookings = {
  create: async (userId, data) => {
    const { data: result, error } = await supabase
      .from('bookings')
      .insert([{ user_id: userId, ...data }])
      .select()
    return { data: result, error }
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: true })
    return { data, error }
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, user_profiles(position, goals)')
      .order('session_date', { ascending: true })
    return { data, error }
  },

  updateStatus: async (bookingId, status) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date() })
      .eq('id', bookingId)
      .select()
    return { data, error }
  },

  delete: async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
    return { error }
  }
}