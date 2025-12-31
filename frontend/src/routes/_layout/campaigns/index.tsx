import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import CampaignsTable from '@/components/Campaigns/CampaignsTable'

export const Route = createFileRoute('/_layout/campaigns/')({
  component: Campaigns,
})

function Campaigns() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 overflow-auto">
          <div className='p-4'>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className='text-2xl font-bold'>Campaigns</h1>
                <p className='text-muted-foreground'>Manage your marketing campaigns</p>
              </div>
            </div>
            <div className='rounded-md border'>
              <div className="p-6">
                <CampaignsTable />
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
