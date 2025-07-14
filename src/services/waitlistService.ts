import { supabase } from '../lib/supabase'

export interface WaitlistEntry {
  id: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  approved_by?: string
  approved_at?: string
  notes?: string
}

export interface WaitlistSubmissionResult {
  success: boolean
  error?: string
  message?: string
}

export class WaitlistService {
  /**
   * Submit an email to the beta waitlist
   */
  static async submitToWaitlist(email: string): Promise<WaitlistSubmissionResult> {
    try {
      // Check if email already exists in waitlist
      const { data: existing, error: checkError } = await supabase
        .from('beta_waitlist')
        .select('id, email, status')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new emails
        console.error('Error checking existing waitlist entry:', checkError)
        return {
          success: false,
          error: 'Failed to check waitlist status. Please try again.'
        }
      }

      if (existing) {
        return {
          success: false,
          error: 'This email is already on the waitlist.',
          message: existing.status === 'pending' ? 
            'Your application is still being reviewed.' : 
            existing.status === 'approved' ? 
              'You have already been approved for beta access. Please check your email.' :
              'Your previous application was not approved. Please contact support for more information.'
        }
      }

      // Add new email to waitlist
      const { data, error } = await supabase
        .from('beta_waitlist')
        .insert([
          {
            email: email,
            status: 'pending'
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding to waitlist:', error)
        return {
          success: false,
          error: 'Failed to join waitlist. Please try again.'
        }
      }

      return {
        success: true,
        message: 'Successfully joined the beta waitlist!'
      }

    } catch (error) {
      console.error('Unexpected error in waitlist submission:', error)
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  /**
   * Get all waitlist entries (admin only)
   */
  static async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching waitlist entries:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error fetching waitlist:', error)
      return []
    }
  }

  /**
   * Approve a waitlist entry and optionally create user account
   */
  static async approveWaitlistEntry(
    entryId: string, 
    approvedBy: string, 
    notes?: string
  ): Promise<WaitlistSubmissionResult> {
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', entryId)
        .select()
        .single()

      if (error) {
        console.error('Error approving waitlist entry:', error)
        return {
          success: false,
          error: 'Failed to approve waitlist entry.'
        }
      }

      return {
        success: true,
        message: 'Waitlist entry approved successfully!'
      }

    } catch (error) {
      console.error('Unexpected error approving waitlist entry:', error)
      return {
        success: false,
        error: 'An unexpected error occurred.'
      }
    }
  }

  /**
   * Reject a waitlist entry
   */
  static async rejectWaitlistEntry(
    entryId: string, 
    rejectedBy: string, 
    notes?: string
  ): Promise<WaitlistSubmissionResult> {
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .update({
          status: 'rejected',
          approved_by: rejectedBy,
          approved_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', entryId)
        .select()
        .single()

      if (error) {
        console.error('Error rejecting waitlist entry:', error)
        return {
          success: false,
          error: 'Failed to reject waitlist entry.'
        }
      }

      return {
        success: true,
        message: 'Waitlist entry rejected.'
      }

    } catch (error) {
      console.error('Unexpected error rejecting waitlist entry:', error)
      return {
        success: false,
        error: 'An unexpected error occurred.'
      }
    }
  }

  /**
   * Check if an email is on the waitlist and get its status
   */
  static async checkWaitlistStatus(email: string): Promise<WaitlistEntry | null> {
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking waitlist status:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Unexpected error checking waitlist status:', error)
      return null
    }
  }
}