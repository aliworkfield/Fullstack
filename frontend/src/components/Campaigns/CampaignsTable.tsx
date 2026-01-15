import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/Common/DataTable"
import { columns } from "./columns"
import { AdminCampaignsService, AdminCouponsService } from "@/client"
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
    queryFn: () => AdminCampaignsService.getAllCampaigns({ search: searchTerm }),
    enabled: canAccessCampaigns, // Only fetch if user has proper role
  })

  // Fetch coupon statistics for each campaign
  const { data: couponStats = {} } = useQuery({
    queryKey: ["campaign-coupon-stats"],
    queryFn: async () => {
      if (!campaignsData || !canAccessCampaigns) return {};
      
      const campaigns = (campaignsData as any)?.campaigns || [];
      const statsPromises = campaigns.map(async (campaign: any) => {
        try {
          const response: any = await AdminCouponsService.getCampaignCouponStats({ campaignId: campaign.id });
          const stats = response.stats || { total: 0, assigned: 0, unassigned: 0, redeemed: 0 };
          // Map backend field names to frontend field names
          return { [campaign.id]: {
            total_coupons: stats.total,
            assigned_coupons: stats.assigned,
            unassigned_coupons: stats.unassigned,
            redeemed_coupons: stats.redeemed
          }};
        } catch (err) {
          console.error(`Error fetching stats for campaign ${campaign.id}:`, err);
          return { [campaign.id]: { total_coupons: 0, assigned_coupons: 0, unassigned_coupons: 0, redeemed_coupons: 0 } };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      return statsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: canAccessCampaigns && !!campaignsData, // Only fetch if user has proper role and campaigns are loaded
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  // Extract campaigns from the response
  const campaigns = (campaignsData as any)?.campaigns || []

  // Combine campaigns with coupon statistics
  const campaignsWithStats = campaigns.map((campaign: any) => {
    const stats = couponStats[campaign.id] || { total_coupons: 0, assigned_coupons: 0, unassigned_coupons: 0 };
    return {
      ...campaign,
      total_coupons: stats.total_coupons,
      assigned_coupons: stats.assigned_coupons,
      unassigned_coupons: stats.unassigned_coupons,
    };
  });

  // Filter campaigns based on search term
  const filteredCampaigns = campaignsWithStats.filter((campaign: any) =>
    (campaign.title && campaign.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
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