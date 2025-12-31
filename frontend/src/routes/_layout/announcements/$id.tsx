import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementsService } from "@/client";

export function AnnouncementDetailRoute() {
  const { id } = Route.useParams();
  
  const { data: announcement, isLoading, isError } = useQuery({
    queryKey: ["announcement", id],
    queryFn: async () => {
      const response = await AnnouncementsService.readAnnouncement({
        id
      });
      return response;
    },
  });

  if (isLoading) {
    return <div>Loading announcement...</div>;
  }

  if (isError || !announcement) {
    return <div>Announcement not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcement Detail</h1>
        <div className="flex gap-2">
          <Button disabled>Edit</Button>
          <Button 
            variant="destructive"
            disabled
          >
            Delete
          </Button>
        </div>
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
  );
}

export const Route = createFileRoute('/_layout/announcements/$id')({
  component: AnnouncementDetailRoute,
});