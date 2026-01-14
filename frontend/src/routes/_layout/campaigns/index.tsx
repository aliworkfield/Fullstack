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
      <main className="flex flex-1 flex-col gap-6 p-6 pt-0 bg-muted/10">
        <div className="flex-1 overflow-auto">
          <div className='max-w-7xl mx-auto w-full'>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>Campaigns</h1>
                <p className='text-muted-foreground'>Manage your marketing campaigns</p>
              </div>
            </div>
            <div className='rounded-xl border bg-card shadow-sm'>
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