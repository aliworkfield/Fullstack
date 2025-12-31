import { useCallback, useEffect, useState } from "react"
import keycloak from "@/keycloak"

interface RoleHook {
  roles: string[]
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isLoading: boolean
}

const useRoles = (): RoleHook => {
  const [roles, setRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        if (keycloak.tokenParsed) {
          const realmRoles = keycloak.tokenParsed.realm_access?.roles || []
          setRoles(realmRoles)
        }
      } catch (error) {
        console.error("Error fetching roles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

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