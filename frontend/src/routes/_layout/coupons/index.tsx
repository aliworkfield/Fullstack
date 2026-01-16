import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { CouponsTable } from '@/components/Coupons/CouponsTable'
import useRoles from '@/hooks/useRoles'

export const Route = createFileRoute('/_layout/coupons/')({
  component: Coupons,
})

function Coupons() {
  const { hasAnyRole, isLoading: rolesLoading } = useRoles()
  
  const isAdminOrManager = hasAnyRole(['admin', 'manager'])

  if (rolesLoading) return <div>Loading...</div>;
  if (!isAdminOrManager) {
    return (
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="flex flex-1 flex-col gap-6 p-6 pt-0 bg-muted/10">
          <div className="flex-1 overflow-auto">
            <div className='max-w-7xl mx-auto w-full'>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className='text-3xl font-bold tracking-tight'>Coupons</h1>
                  <p className='text-muted-foreground'>Manage all discount coupons in the system</p>
                </div>
              </div>
              
              <div className='rounded-xl border bg-card shadow-sm'>
                <div className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Coupon management is only available to administrators and managers.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-6 p-6 pt-0 bg-muted/10">
        <div className="flex-1 overflow-auto">
          <div className='max-w-7xl mx-auto w-full'>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>Coupons</h1>
                <p className='text-muted-foreground'>Manage all discount coupons in the system</p>
              </div>
            </div>
            
            <div className='rounded-xl border bg-card shadow-sm'>
              <div className="p-6">
                <CouponsTable />
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}