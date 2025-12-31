import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { app__models__announcement__AnnouncementPublic } from "@/client";
import { AnnouncementCard } from "./AnnouncementCard";

interface AnnouncementsByCategoryProps {
  category: string;
  title: string;
  announcements: app__models__announcement__AnnouncementPublic[];
}

export function AnnouncementsByCategory({ 
  category, 
  title, 
  announcements 
}: AnnouncementsByCategoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnnouncements = announcements.filter(announcement => {
    // Filter by search term
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.description && announcement.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category (if not 'all' or specific category)
    const matchesCategory = category === 'all' || announcement.category === category;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          <Badge variant="outline" className="text-sm">
            {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'}
          </Badge>
        </div>
        <div className="relative w-64">
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {filteredAnnouncements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard 
              key={announcement.id} 
              announcement={announcement} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No announcements found matching your search.
        </div>
      )}
    </div>
  );
}