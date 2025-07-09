import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/OptimizedAuthContext'
import { checkAdminRole, hasRole } from '../lib/roleHelpers'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: string
  requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole, 
  requireAdmin = false 
}) => {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        let access = true

        // ✅ CORRECT: Use the fixed checkAdminRole function
        if (requireAdmin) {
          access = await checkAdminRole(user.id)
        } else if (requireRole) {
          // ✅ CORRECT: Use the fixed hasRole function
          access = await hasRole(user.id, requireRole)
        }

        setHasAccess(access)
      } catch (error) {
        console.error('Error checking access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, requireRole, requireAdmin])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return <div>Access denied</div>
  }

  return <>{children}</>
}