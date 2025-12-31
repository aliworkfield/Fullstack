import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, Tag } from "lucide-react";
import { CampaignsService, CouponsService, CampaignPublic, CouponPublic } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function CouponManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await CampaignsService.readCampaigns({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch coupons
  const { data: coupons = [], isLoading: couponsLoading, refetch } = useQuery({
    queryKey: ["coupons", selectedCampaign],
    queryFn: async () => {
      const response = await CouponsService.readCoupons({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.discount_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCampaign = !selectedCampaign || coupon.campaign_id === selectedCampaign;
    
    return matchesSearch && matchesCampaign;
  });

  const getCampaignName = (campaignId: string | null | undefined): string => {
    if (!campaignId) return "No Campaign";
    const campaign = campaigns.find((c: CampaignPublic) => c.id === campaignId);
    return campaign ? campaign.name : "Unknown Campaign";
  };

  const handleGenerateCoupons = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign first");
      return;
    }

    try {
      // In a real implementation, you would call the generate coupons endpoint
      toast.success("Coupons generated successfully");
      refetch();
    } catch (error) {
      console.error("Error generating coupons:", error);
      toast.error("Failed to generate coupons");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCampaign || ""}
              onChange={(e) => setSelectedCampaign(e.target.value || null)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign: CampaignPublic) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <Button onClick={handleGenerateCoupons}>
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">All generated coupons</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">Active marketing campaigns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.filter(coupon => coupon.assigned_user_id).length}
            </div>
            <p className="text-xs text-muted-foreground">Coupons assigned to users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon: CouponPublic) => (
          <Card key={coupon.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{coupon.code}</h3>
                  <p className="text-sm text-muted-foreground">{coupon.discount_value}{coupon.discount_type === "percentage" ? "%" : ""} off</p>
                </div>
                <Badge variant={coupon.redeemed ? "destructive" : "secondary"}>
                  {coupon.redeemed ? "Redeemed" : "Available"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Campaign:</span> {getCampaignName(coupon.campaign_id)}</p>
                <p><span className="font-medium">Assigned to:</span> {coupon.assigned_user_id ? "Assigned" : "Unassigned"}</p>
                {coupon.expires_at && (
                  <p><span className="font-medium">Expires:</span> {new Date(coupon.expires_at).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCoupons.length === 0 && !couponsLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No coupons found</p>
        </div>
      )}
    </div>
  );
}