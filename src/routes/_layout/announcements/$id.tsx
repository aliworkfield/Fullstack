import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { announcementsReadAnnouncement } from "@/client";
import { CouponPublic } from "@/client";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { CreateAnnouncementModal } from "@/components/Announcements/CreateAnnouncementModal";
import useRoles from "@/hooks/useRoles";

export function AnnouncementDetail() {
  const { id } = useParams({ from: "/_layout/announcements/$id" });
  const { user } = useAuth();
  const { hasRole } = useRoles();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: announcement, isLoading, isError, error } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => announcementsReadAnnouncement({ path: { id } }).then(response => response.data),
  });

  // Load coupon if required
  const [coupon, setCoupon] = useState<CouponPublic | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  useEffect(() => {
    if (announcement?.requires_coupon && user) {
      setLoadingCoupon(true);
      // In a real app, you would fetch the user's coupon for this announcement
      // For now, we'll just fetch a generic coupon or indicate if none exists
      setLoadingCoupon(false);
    }
  }, [announcement, user]);

  if (isLoading) return <div>Loading announcement...</div>;
  if (isError) return <div>Error loading announcement: {(error as Error).message}</div>;

  const canEdit = hasRole("admin") || hasRole("manager");

  return (
    <div className="container mx-auto py-8">
      {announcement && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{announcement.title}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{announcement.category}</Badge>
                {announcement.requires_coupon && (
                  <Badge variant="outline">Coupon Required</Badge>
                )}
              </div>
            </div>
            {canEdit && (
              <Button onClick={() => {
                setEditModalOpen(true);
              }}>
                Edit
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{announcement.description}</p>
                
                {announcement.requires_coupon && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h3 className="font-semibold mb-2">Coupon Information</h3>
                    {loadingCoupon ? (
                      <p>Loading coupon...</p>
                    ) : coupon ? (
                      <div>
                        <p className="text-lg font-mono bg-background p-2 rounded">{coupon.code}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Discount: {coupon.discount_value} {coupon.discount_type}
                        </p>
                      </div>
                    ) : (
                      <p>No coupon assigned to you for this announcement.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-mono text-sm">{announcement.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p>{announcement.is_published ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p>Not available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {announcement && (
        <CreateAnnouncementModal 
          open={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          announcement={announcement as any} 
        />
      )}
    </div>
  );
}