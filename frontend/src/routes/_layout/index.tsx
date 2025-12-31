import { SidebarProvider } from "@/components/ui/sidebar"
import { createFileRoute, Outlet } from '@tanstack/react-router'

import AppSidebar from "@/components/Sidebar/AppSidebar"
import useAuth from '@/hooks/useAuth'

export const Route = createFileRoute('/_layout/')({
  component: Dashboard,
})

function Dashboard() {
  const { user, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>
  }

  // If no user data, don't render the layout
  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Coupon Management Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Campaigns</h2>
                <p className="text-muted-foreground mb-4">Manage your marketing campaigns</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Create, edit, and track campaigns</span>
                </div>
              </div>
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Coupons</h2>
                <p className="text-muted-foreground mb-4">Generate and manage discount coupons</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Create and distribute coupons</span>
                </div>
              </div>
              <div className="bg-card rounded-lg border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Announcements</h2>
                <p className="text-muted-foreground mb-4">Broadcast important messages !!!</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Notify users of updates and news</span>
                </div>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}