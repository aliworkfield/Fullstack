import { createFileRoute, Link as RouterLink } from "@tanstack/react-router"

import { AuthLayout } from "@/components/Common/AuthLayout"
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
          <h1 className="text-2xl font-bold">Login to your account</h1>
        </div>

        <div className="grid gap-4">
          <Button onClick={handleLogin} size="lg">
            Log In with Keycloak
          </Button>
          
          <Button variant="outline" onClick={handleLogout} size="lg">
            Logout
          </Button>
        </div>

        <div className="text-center text-sm">
          Don't have an account yet?{" "}
          <RouterLink to="/signup" className="underline underline-offset-4">
            Sign up
          </RouterLink>
        </div>
      </div>
    </AuthLayout>
  )
}