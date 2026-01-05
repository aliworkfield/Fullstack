import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "./columns"
import { CampaignsService } from "@/client"
import { CampaignPublic, CampaignsPublic } from "@/client"
import useRoles from "@/hooks/useRoles"
import { CreateCampaignModal } from "./CreateCampaignModal"

function CampaignsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { hasRole } = useRoles()
  
  // Check if user is admin or manager to show create button and access data
  const canAccessCampaigns = hasRole("admin") || hasRole("manager")

  const { data: campaignsData, isLoading, isError, error } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => CampaignsService.readCampaigns({ skip: 0, limit: 100 }).then(response => {
      // Transform the response to match expected format
      return {
        data: response.data,
        count: response.data?.length || 0
      } as CampaignsPublic;
    }),
    enabled: canAccessCampaigns, // Only fetch if user has proper role
  })

  if (!canAccessCampaigns) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have permission to view campaigns.</p>
        <p className="text-sm text-muted-foreground">Contact an administrator for access.</p>
      </div>
    )
  }

  if (isLoading) {
    return <div>Loading campaigns...</div>
  }

  if (isError) {
    // Check if it's a 403 error
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 403) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to view campaigns.</p>
          <p className="text-sm text-muted-foreground">Contact an administrator for access.</p>
        </div>
      )
    }
    return <div>Error loading campaigns: {(error as Error).message}</div>
  }

  // Ensure campaignsData is not undefined
  const campaigns: CampaignsPublic = campaignsData || { data: [], count: 0 }

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.data.filter((campaign: CampaignPublic) =>
    (campaign.name && campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Check if user is admin or manager to show create button
  const canCreateCampaign = hasRole("admin") || hasRole("manager")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {canCreateCampaign && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        )}
      </div>
      <DataTable 
        columns={columns} 
        data={filteredCampaigns} 
      />
      <CreateCampaignModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  )
}

export default CampaignsTable