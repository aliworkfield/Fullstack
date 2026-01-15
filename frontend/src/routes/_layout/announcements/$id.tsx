import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementsService, UserCouponsService } from "@/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar/AppSidebar";
import useRoles from "@/hooks/useRoles";
import { toast } from "sonner";
import { CreateAnnouncementModal } from "@/components/Announcements/CreateAnnouncementModal";
import { useState, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_layout/announcements/$id")({
  component: AnnouncementDetailRoute,
});

export function AnnouncementDetailRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasAnyRole, isLoading: rolesLoading } = useRoles();
  const canEdit = hasAnyRole(["admin", "manager"]);

  const { data: announcement, isLoading, isError, error } = useQuery({
    queryKey: ["announcement", id],
    queryFn: async () => {
      console.log('Fetching announcement with id:', id);
      const response = await AnnouncementsService.readAnnouncement({ id });
      console.log('Received announcement:', response);
      return response;
    }
  });

  const { data: userCoupons, isLoading: isCouponLoading } = useQuery({
    queryKey: ["user-coupons"],
    queryFn: async () => {
      try {
        const response: any = await UserCouponsService.getMyCoupons();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching user coupons:", error);
        return [];
      }
    },
  });

  // Filter user coupons by the current announcement's campaign ID
  const campaignCoupons = useMemo(() => {
    if (!announcement?.campaign_id || !userCoupons) return [];
    return userCoupons.filter((coupon: any) => coupon.campaign_id === announcement.campaign_id);
  }, [userCoupons, announcement?.campaign_id]);

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) =>
      await AnnouncementsService.deleteAnnouncementEndpoint({ id: announcementId }),
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      navigate({ to: "/announcements" });
    },
    onError: (error: unknown) => {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState<string | boolean>(false);

  // Mutation to redeem coupon
  const redeemMutation = useMutation({
    mutationFn: async (couponId: string) => {
      return await UserCouponsService.redeemCoupon({ couponId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error: unknown) => {
      console.error("Error redeeming coupon:", error);
      toast.error("Failed to redeem coupon");
    },
  });

  if (isLoading || rolesLoading) return <div>Loading announcement...</div>;
  if (isError) {
    console.error('Error loading announcement:', id, error);
    return <div>Announcement not found</div>;
  }
  if (!announcement) return <div>Announcement not found</div>;

  const handleEdit = () => setIsEditModalOpen(true);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-6 p-6 pt-6 overflow-y-scroll bg-muted/10">
        <div className="flex-1 overflow-auto">
          <div className='max-w-7xl mx-auto w-full'>
            <div className='rounded-xl border bg-card shadow-sm'>
              <div className="p-6 space-y-6">
                {/* Top Bar: Title left, Back + Edit/Delete right */}
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">{announcement.title}</h2>

                  <div className="flex items-center gap-4">
                    <Link
                      to="/announcements"
                      className="text-muted-foreground hover:text-foreground whitespace-nowrap"
                    >
                      ← Back to Announcements
                    </Link>

                    {canEdit && (
                      <div className="flex gap-2">
                        <Button onClick={handleEdit}>Edit</Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader className="space-y-2">
                    {/* Title + Category Badge */}
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-2xl leading-tight">{announcement.title}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {announcement.category}
                      </Badge>
                    </div>

                    {/* Compact Dates */}
                    <div className="text-xs text-muted-foreground flex gap-4">
                      <span>
                        Created:{" "}
                        {announcement.created_date
                          ? new Date(announcement.created_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                      {announcement.expiry_date && (
                        <span>Expires: {new Date(announcement.expiry_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Description */}
                    <div className="prose max-w-none text-muted-foreground">
                      {announcement.description || "No description provided"}
                    </div>
                    
                    {/* Status Badge - Visible only to admin/manager */}
                    {canEdit && (
                      <div className="flex justify-end mt-4">
                        <div className="flex items-center gap-2">
                          {announcement.is_published ? (
                            <Badge variant="default">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {announcement.expiry_date && new Date(announcement.expiry_date) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Coupon Section */}
                    {announcement.requires_coupon && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2 ">    Your Discount Code{campaignCoupons.length !== 1 ? 's' : ''}</h3>
                        {isCouponLoading ? (
                          <p className="text-muted-foreground">Loading your coupon{campaignCoupons.length !== 1 ? 's' : ''}...</p>
                        ) : campaignCoupons.length > 0 ? (
                          <div className="space-y-4">
                            {campaignCoupons.map((coupon: any) => {
                              const isRedeemedForCoupon = isRedeemed && isRedeemed === coupon.id;
                              return (
                                <div key={coupon.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  {coupon.redeemed ? (
                                    <div>
                                      <div className="relative mb-2">
                                        <p className="text-lg font-bold text-center text-blue-800">
                                          {isRedeemedForCoupon ? coupon.code : '••••••••••••'}
                                        </p>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => setIsRedeemed(isRedeemedForCoupon ? false : coupon.id)}
                                          className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                                        >
                                          {isRedeemedForCoupon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                      </div>
                                      <p className="text-sm text-center text-blue-600">
                                        {coupon.discount_type === "percentage"
                                          ? `${coupon.discount_value}% discount`
                                          : `Value: ${coupon.discount_value}`}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <Button 
                                        onClick={() => {
                                          setIsRedeemed(coupon.id);
                                          if (coupon && !coupon.redeemed) {
                                            redeemMutation.mutate(coupon.id);
                                          }
                                        }}
                                        className="flex items-center gap-2 mx-auto"
                                        disabled={redeemMutation.isPending}
                                      >
                                        <Eye className="w-4 h-4" />
                                        {redeemMutation.isPending ? "İndirim Kodu Kullanılıyor..." : "İndirim Kodunu Görüntüle"}
                                      </Button>
                                      {/* <p className="text-sm text-blue-600 mt-2">
                                        İndirim Kodunu Görüntüle
                                      </p> */}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-center text-gray-600">
                              No coupon assigned to you for this campaign
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {canEdit && announcement && (
        <CreateAnnouncementModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          announcement={announcement}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["announcement", id] });
          }}
        />
      )}
    </SidebarProvider>
  );
}