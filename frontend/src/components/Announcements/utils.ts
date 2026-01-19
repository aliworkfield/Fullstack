import { app__models__announcement__AnnouncementPublic } from "@/client";

export function groupAnnouncementsByCategory(announcements: app__models__announcement__AnnouncementPublic[]): Record<string, app__models__announcement__AnnouncementPublic[]> {
  const grouped: Record<string, app__models__announcement__AnnouncementPublic[]> = {};

  announcements.forEach((announcement) => {
    if (!grouped[announcement.category]) {
      grouped[announcement.category] = [];
    }
    grouped[announcement.category].push(announcement);
  });

  // Sort each category by created_date, newest first
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      if (a.created_date && b.created_date) {
        return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
      }
      if (a.created_date) return -1;
      if (b.created_date) return 1;
      return 0;
    });
  });

  return grouped;
}

export function getRecentAnnouncements(announcements: app__models__announcement__AnnouncementPublic[], days = 10): app__models__announcement__AnnouncementPublic[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return announcements.filter(announcement => {
    if (!announcement.created_date) return false;
    const announcementDate = new Date(announcement.created_date);
    return announcementDate >= cutoffDate;
  });
}