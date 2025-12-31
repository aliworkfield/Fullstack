import { ReactNode, useEffect } from "react"
import keycloak from "@/keycloak"
import useAuth from "@/hooks/useAuth"

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading, isError } = useAuth()

  // Handle Keycloak authentication state changes
  useEffect(() => {
    const handleAuthRefresh = () => {
      // Force a re-render when auth state changes
    }

    // Listen for Keycloak events
    keycloak.onAuthSuccess = handleAuthRefresh
    keycloak.onAuthLogout = handleAuthRefresh
    keycloak.onTokenExpired = handleAuthRefresh

    return () => {
      // Cleanup listeners
      keycloak.onAuthSuccess = undefined
      keycloak.onAuthLogout = undefined
      keycloak.onTokenExpired = undefined
    }
  }, [])

  if (!keycloak.authenticated) {
    return <div>Authenticating...</div>
  }

  if (isLoading) {
    return <div>Loading user...</div>
  }

  if (isError) {
    return <div>Failed to load user</div>
  }

  // Use the user variable to prevent TypeScript warning
  if (!user) {
    return <div>User not authenticated</div>
  }

  return <>{children}</>
}