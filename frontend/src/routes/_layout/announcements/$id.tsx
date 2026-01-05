import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementsService, app__schemas__announcement__AnnouncementUpdate, app__models__announcement__AnnouncementPublic } from "@/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar/AppSidebar";
import useRoles from "@/hooks/useRoles";
import { toast } from "sonner";
import { EditAnnouncementModal } from "@/components/Announcements/EditAnnouncementModal";
import { useState } from "react";

export function AnnouncementDetailRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasAnyRole, isLoading: rolesLoading } = useRoles();
  const canEdit = hasAnyRole(["admin", "manager"]);
  
  const { data: announcement, isLoading, isError } = useQuery({
    queryKey: ["announcement", id],
    queryFn: async () => {
      const response = await AnnouncementsService.readAnnouncement({
        id
      });
      return response;
    },
  });

  // Mutation for deleting announcement
  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      return await AnnouncementsService.deleteAnnouncementEndpoint({ id: announcementId });
    },
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      navigate({ to: "/announcements" });
    },
    onError: (error) => {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading || rolesLoading) {
    return <div>Loading announcement...</div>;
  }

  if (isError || !announcement) {
    return <div>Announcement not found</div>;
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 overflow-auto">
          <div className='p-4'>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link to="/announcements" className="text-muted-foreground hover:text-foreground">
                    ← Back to Announcements
                  </Link>
                  <h1 className="text-3xl font-bold">Announcement Detail</h1>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button onClick={handleEdit}>
                      Edit
                    </Button>
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

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge variant={announcement.is_published ? "default" : "secondary"}>
                      {announcement.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Category</h3>
                      <p className="text-muted-foreground">{announcement.category}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Content</h3>
                      <p className="text-muted-foreground">{announcement.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Created Date</h3>
                      <p className="text-muted-foreground">
                        {announcement.created_date ? new Date(announcement.created_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      {canEdit && announcement && (
        <EditAnnouncementModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          announcement={announcement}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["announcement", id] });
          }}
        />
      )}
    </SidebarProvider>
  );
}

export const Route = createFileRoute('/_layout/announcements/$id')({
  component: AnnouncementDetailRoute,
});