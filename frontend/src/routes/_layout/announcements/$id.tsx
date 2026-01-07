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
import { useState } from "react";

export const Route = createFileRoute("/_layout/announcements/$id")({
  component: AnnouncementDetailRoute,
});

export function AnnouncementDetailRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasAnyRole, isLoading: rolesLoading } = useRoles();
  const canEdit = hasAnyRole(["admin", "manager"]);

  const { data: announcement, isLoading, isError } = useQuery({
    queryKey: ["announcement", id],
    queryFn: async () => {
      const response = await AnnouncementsService.readAnnouncement({ id });
      return response;
    },
  });

  const { data: userCoupon, isLoading: isCouponLoading } = useQuery({
    queryKey: ["user-coupon", announcement?.campaign_id],
    queryFn: async () => {
      if (announcement?.requires_coupon && announcement?.campaign_id) {
        try {
          const response: any = await UserCouponsService.getMyCouponForCampaign({
            campaignId: announcement.campaign_id,
          });
          return response.coupon;
        } catch {
          return null;
        }
      }
      return null;
    },
    enabled: !!announcement && announcement.requires_coupon && !!announcement.campaign_id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) =>
      await AnnouncementsService.deleteAnnouncementEndpoint({ id: announcementId }),
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      navigate({ to: "/announcements" });
    },
    onError: (error) => {
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

  if (isLoading || rolesLoading) return <div>Loading announcement...</div>;
  if (isError || !announcement) return <div>Announcement not found</div>;

  const handleEdit = () => setIsEditModalOpen(true);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
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

                {/* Status Badge */}
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

                {/* Coupon Section */}
                {announcement.requires_coupon && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Your Discount Code</h3>
                    {isCouponLoading ? (
                      <p className="text-muted-foreground">Loading your coupon...</p>
                    ) : userCoupon ? (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-lg font-bold text-center text-blue-800">{userCoupon.code}</p>
                        <p className="text-sm text-center text-blue-600 mt-1">
                          {userCoupon.discount_type === "percentage"
                            ? `${userCoupon.discount_value}% discount`
                            : `Fixed discount of ${userCoupon.discount_value}`}
                        </p>
                        {userCoupon.redeemed && (
                          <p className="text-sm text-center text-red-600 mt-2">
                            Coupon already redeemed
                          </p>
                        )}
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