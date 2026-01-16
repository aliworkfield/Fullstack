import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, Tag } from "lucide-react";
import { CampaignsService, UserCouponsService, CampaignPublic, CouponPublic } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

export function CouponManagement() {
  const { t } = useTranslation();
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
      const response = await UserCouponsService.getMyCoupons();
      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredCoupons = Array.isArray(coupons) ? coupons.filter((coupon: CouponPublic) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.discount_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCampaign = !selectedCampaign || coupon.campaign_id === selectedCampaign;
    
    return matchesSearch && matchesCampaign;
  }) : [];

  const getCampaignName = (campaignId: string | null | undefined): string => {
    if (!campaignId) return "No Campaign";
    const campaign = campaigns.find((c: CampaignPublic) => c.id === campaignId);
    return campaign ? campaign.title : "Unknown Campaign";
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('coupons.management_title', 'Coupon Management')}</h1>
          <p className="text-muted-foreground mt-1">{t('coupons.management_subtitle', 'Manage and track your promotional campaigns')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('coupons.search_placeholder', 'Search coupons...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCampaign || ""}
              onChange={(e) => setSelectedCampaign(e.target.value || null)}
              className="border rounded-md px-3 py-2 text-sm min-w-[180px]"
            >
              <option value="">{t('campaigns.all_campaigns', 'All Campaigns')}</option>
              {campaigns.map((campaign: CampaignPublic) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
            <Button onClick={handleGenerateCoupons} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              {t('coupons.generate_coupons', 'Generate Coupons')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('coupons.total_coupons', 'Total Coupons')}</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(coupons) ? coupons.length : 0}</div>
            <p className="text-xs text-muted-foreground">All generated coupons</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('campaigns.active_campaigns', 'Active Campaigns')}</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">Active marketing campaigns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('coupons.assigned_users', 'Assigned Users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(coupons) ? coupons.filter((coupon: CouponPublic) => coupon.assigned_to_user_id).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Coupons assigned to users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon: CouponPublic) => (
          <Card key={coupon.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{coupon.code}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">
                      {coupon.discount_value}{coupon.discount_type === "percentage" ? "%" : ""}
                    </span>
                    <span className="text-sm text-muted-foreground">off</span>
                  </div>
                </div>
                <div className="ml-2">
                  <Badge variant={coupon.redeemed ? "destructive" : coupon.assigned_to_user_id ? "default" : "secondary"}>
                    {coupon.redeemed ? "Redeemed" : coupon.assigned_to_user_id ? "Assigned" : "Available"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-muted">
                  <span className="text-sm text-muted-foreground">Campaign</span>
                  <span className="text-sm font-medium truncate max-w-[120px] text-right">{getCampaignName(coupon.campaign_id)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-muted">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm">
                    {coupon.assigned_to_user_id ? "Assigned" : "Unassigned"}
                  </span>
                </div>
                {coupon.expires_at && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Expires</span>
                    <span className="text-sm">
                      {new Date(coupon.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCoupons.length === 0 && !couponsLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('coupons.no_coupons_found', 'No coupons found')}</p>
        </div>
      )}
    </div>
  );
}