import { ReactNode, useEffect } from "react"
import keycloak from "@/keycloak"
import useAuth from "@/hooks/useAuth"
import { useTranslation } from 'react-i18next'

export default function AuthGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
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
    return <div>{t('auth.authenticating', 'Authenticating...')}</div>
  }

  if (isLoading) {
    return <div>{t('auth.loading_user', 'Loading user...')}</div>
  }

  if (isError) {
    return <div>{t('auth.failed_load_user', 'Failed to load user')}</div>
  }

  // Use the user variable to prevent TypeScript warning
  if (!user) {
    return <div>{t('auth.not_authenticated', 'User not authenticated')}</div>
  }

  return <>{children}</>
}