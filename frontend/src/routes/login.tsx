import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
import { useTranslation } from 'react-i18next';

import { AuthLayout } from "@/components/Common/AuthLayout";
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import keycloak from "@/keycloak"

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      {
        title: "Log In - FastAPI Cloud",
      },
    ],
  }),
})

function Login() {
  const { t } = useTranslation();
  const { logout } = useAuth()

  const handleLogin = () => {
    keycloak.login()
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{t('auth.login_to_account', 'Login to your account')}</h1>
        </div>

        <div className="grid gap-4">
          <Button onClick={handleLogin} size="lg">
            {t('auth.login_with_keycloak', 'Log In with Keycloak')}
          </Button>
          
          <Button variant="outline" onClick={handleLogout} size="lg">
            {t('auth.logout', 'Logout')}
          </Button>
        </div>

        <div className="text-center text-sm">
          {t('auth.no_account_yet', "Don't have an account yet?")}{' '}
          <RouterLink to="/signup" className="underline underline-offset-4">
            {t('auth.sign_up', 'Sign up')}
          </RouterLink>
        </div>
      </div>
    </AuthLayout>
  )
}