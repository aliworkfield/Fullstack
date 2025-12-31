import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { CouponsTable } from '@/components/Coupons/CouponsTable'
import { UserCouponsTable } from '@/components/Coupons/UserCouponsTable'
import useRoles from '@/hooks/useRoles'

export const Route = createFileRoute('/_layout/coupons/')({
  component: Coupons,
})

function Coupons() {
  const { hasAnyRole } = useRoles()
  
  const isAdminOrManager = hasAnyRole(['admin', 'manager'])

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 overflow-auto">
          <div className='p-4'>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className='text-2xl font-bold'>Coupons</h1>
                <p className='text-muted-foreground'>Generate and manage discount coupons</p>
              </div>
            </div>
            
            {isAdminOrManager ? (
              <div className='rounded-md border'>
                <div className="p-6">
                  <CouponsTable />
                </div>
              </div>
            ) : (
              <div className='rounded-md border'>
                <div className="p-6">
                  <UserCouponsTable />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}