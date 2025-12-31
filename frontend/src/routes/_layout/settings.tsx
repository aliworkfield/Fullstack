import { createFileRoute } from "@tanstack/react-router"

import { UpdateProfile } from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import { UserInformation } from "@/components/UserSettings/UserInformation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "Settings - FastAPI Cloud",
      },
    ],
  }),
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  
  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="my-profile">
        <TabsList>
          <TabsTrigger value="my-profile">My profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="danger-zone">Danger zone</TabsTrigger>
        </TabsList>
        <TabsContent value="my-profile">
          <UserInformation user={{
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.full_name || null
          }} />
        </TabsContent>
        <TabsContent value="password">
          <UpdateProfile />
        </TabsContent>
        <TabsContent value="danger-zone">
          <DeleteAccount />
        </TabsContent>
      </Tabs>
    </div>
  )
}