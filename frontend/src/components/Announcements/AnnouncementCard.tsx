import { app__models__announcement__AnnouncementPublic } from "@/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnnouncementCardProps {
  announcement: app__models__announcement__AnnouncementPublic;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">{announcement.title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{announcement.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {announcement.created_date ? new Date(announcement.created_date).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {announcement.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          {announcement.is_published ? "Published" : "Draft"}
        </span>
      </CardFooter>
    </Card>
  );
}