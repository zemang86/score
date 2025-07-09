import { supabase } from './supabase'

// ✅ CORRECT: Query client_users and join to user_roles
export const checkAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('role:user_roles(role_type)')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error checking admin role:', error)
      return false
    }

    // Check if user has admin role
    return data?.role?.role_type === 'admin'
  } catch (error) {
    console.error('Error in checkAdminRole:', error)
    return false
  }
}

// ✅ CORRECT: Get user role through proper join
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('role:user_roles(role_type)')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error getting user role:', error)
      return null
    }

    return data?.role?.role_type || null
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

// ✅ CORRECT: Check if user has specific role
export const hasRole = async (userId: string, roleType: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('role:user_roles(role_type)')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error checking role:', error)
      return false
    }

    return data?.role?.role_type === roleType
  } catch (error) {
    console.error('Error in hasRole:', error)
    return false
  }
}