import { app__models__announcement__AnnouncementPublic } from "@/client";
import { Card, CardHeader } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";

interface AnnouncementCardProps {
  announcement: app__models__announcement__AnnouncementPublic;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate({ 
      to: '/announcements/$id', 
      params: { id: announcement.id } 
    });
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader>
        <h3 className="text-lg font-semibold">{announcement.title}</h3>
      </CardHeader>
    </Card>
  );
}