import { AnnouncementsByCategory } from "./AnnouncementsByCategory";
import { app__models__announcement__AnnouncementPublic } from "@/client";

interface AnnouncementsTableProps {
  announcements: app__models__announcement__AnnouncementPublic[];
}

export function AnnouncementsTable({ announcements }: AnnouncementsTableProps) {
  // Group announcements by category
  const groupedAnnouncements: Record<string, app__models__announcement__AnnouncementPublic[]> = {};
  
  announcements.forEach(announcement => {
    if (!groupedAnnouncements[announcement.category]) {
      groupedAnnouncements[announcement.category] = [];
    }
    groupedAnnouncements[announcement.category].push(announcement);
  });

  return (
    <div className="space-y-8">
      {Object.entries(groupedAnnouncements).map(([category, categoryAnnouncements]) => (
        <AnnouncementsByCategory
          key={category}
          category={category}
          title={category}
          announcements={categoryAnnouncements}
        />
      ))}
      {Object.keys(groupedAnnouncements).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No announcements found
        </div>
      )}
    </div>
  );
}