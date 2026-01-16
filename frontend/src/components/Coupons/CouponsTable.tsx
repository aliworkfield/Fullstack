import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { AdminCouponsService, AdminCampaignsService } from "@/client";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/Common/DataTable";
import { useCouponColumns } from "./translated-columns";

export function CouponsTable() {
  const { t } = useTranslation();
  const columns = useCouponColumns();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all coupons from the admin service
  const { data: coupons = [], isLoading: couponsLoading } = useQuery({
    queryKey: ["all-coupons"],
    queryFn: async () => {
      const response = await AdminCouponsService.getAllCoupons({
        skip: 0,
        limit: 1000, // Get all coupons
      });
      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch all campaigns to get campaign names
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["all-campaigns"],
    queryFn: async () => {
      const response = await AdminCampaignsService.getAllCampaigns({});
      return response?.campaigns || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Create a map of campaign id to campaign name for quick lookup
  const campaignMap = useMemo(() => {
    const map = new Map();
    campaigns.forEach((campaign: any) => {
      map.set(campaign.id, campaign.title);
    });
    return map;
  }, [campaigns]);
  
  // Combine coupon data with campaign names
  const couponsWithCampaigns = useMemo(() => {
    return coupons.map((coupon: any) => ({
      ...coupon,
      campaign_title: coupon.campaign_id ? campaignMap.get(coupon.campaign_id) || 'Unknown Campaign' : 'No Campaign',
    }));
  }, [coupons, campaignMap]);
  
  const isLoading = couponsLoading || campaignsLoading;

  const filteredCoupons = Array.isArray(couponsWithCampaigns) ? couponsWithCampaigns.filter((coupon: any) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.discount_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.campaign_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) : [];

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('coupons.all_coupons')}</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('coupons.search_coupons')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full sm:w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('coupons.all_coupons')} ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredCoupons}
          />
        </CardContent>
      </Card>
    </div>
  );
}