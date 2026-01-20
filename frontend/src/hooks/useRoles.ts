import { useCallback } from "react"
import useAuth from "./useAuth"

interface RoleHook {
  roles: string[]
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isLoading: boolean
}

const useRoles = (): RoleHook => {
  const { user, isLoading } = useAuth()

  // Get role from user object (database based)
  const userRole = user?.role ? [user.role] : [] // Convert single role to array for compatibility

  // Add 'user' role implicitly if authenticated
  const roles = user ? [...userRole, 'user'] : []

  // If user is admin, they effectively have manager role too for most operations
  if (user?.role === 'admin') {
    roles.push('manager')
  }

  const hasRole = useCallback((role: string): boolean => {
    return roles.includes(role)
  }, [roles])

  const hasAnyRole = useCallback((rolesToCheck: string[]): boolean => {
    return roles.some(role => rolesToCheck.includes(role))
  }, [roles])

  return {
    roles,
    hasRole,
    hasAnyRole,
    isLoading
  }
}

export default useRoles