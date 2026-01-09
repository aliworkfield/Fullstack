import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { app__models__announcement__AnnouncementPublic } from "@/client";

interface GroupedAnnouncementsProps {
  announcements: app__models__announcement__AnnouncementPublic[];
}

export function GroupedAnnouncements({ announcements }: GroupedAnnouncementsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // Add category filter
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Calculate "New" announcements (created within last 10 days)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const newAnnouncements = announcements.filter(announcement => {
    const createdDate = new Date(announcement.created_date || '');
    return createdDate > tenDaysAgo;
  });

  // Group all announcements by category (including those that are also "New")
  const groupedByCategory: Record<string, app__models__announcement__AnnouncementPublic[]> = {};
  announcements.forEach(announcement => {
    const category = announcement.category || 'Uncategorized';
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = [];
    }
    groupedByCategory[category].push(announcement);
  });

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedByCategory).sort();

  // Apply search and category filtering to each section
  const filteredNewAnnouncements = newAnnouncements.filter(announcement => {
    const matchesSearch = !searchTerm || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (announcement.description && announcement.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || selectedCategory === "new";
    
    return matchesSearch && matchesCategory;
  });

  const filteredByCategory: Record<string, app__models__announcement__AnnouncementPublic[]> = {};
  sortedCategories.forEach(category => {
    filteredByCategory[category] = groupedByCategory[category].filter(announcement => {
      const matchesSearch = !searchTerm || 
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (announcement.description && announcement.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || selectedCategory === category;
      
      return matchesSearch && matchesCategory;
    });
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Announcements</h1>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 w-48"
          >
            <option value="all">All Categories</option>
            <option value="new">New</option>
            {sortedCategories.map(category => (
              <option key={`cat-opt-${category}`} value={category}>{category}</option>
            ))}
          </select>
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
      </div>

      {/* New Announcements Section - Only show if category filter is "all" or "new" */}
      {(selectedCategory === "all" || selectedCategory === "new") && filteredNewAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleCategory('new')}
          >
            {expandedCategories['new'] !== false ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            <h2 className="text-xl font-bold text-blue-600">New</h2>
            <Badge variant="secondary">{filteredNewAnnouncements.length}</Badge>
          </div>
          
          {expandedCategories['new'] !== false && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNewAnnouncements.map((announcement) => (
                <div 
                  key={`new-${announcement.id}`} 
                  className="border rounded-lg p-4 hover:bg-muted cursor-pointer"
                >
                  <h3 className="font-semibold">{announcement.title}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other Categories - Only show if category filter is "all" or matches this category */}
      {sortedCategories.map(category => {
        const categoryAnnouncements = filteredByCategory[category];
        const isExpanded = expandedCategories[category] !== false;
        
        // Only show this category if it matches the selected filter
        const shouldShowCategory = selectedCategory === "all" || selectedCategory === category;
        
        if (!shouldShowCategory || categoryAnnouncements.length === 0) {
          return null;
        }
        
        return (
          <div key={category} className="space-y-4">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              <h2 className="text-xl font-bold">{category}</h2>
              <Badge variant="outline">{categoryAnnouncements.length}</Badge>
            </div>
            
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAnnouncements.map((announcement) => (
                  <div 
                    key={`cat-${announcement.id}`} 
                    className="border rounded-lg p-4 hover:bg-muted cursor-pointer"
                  >
                    <h3 className="font-semibold">{announcement.title}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Show message if no announcements match the filters */}
      {selectedCategory === "all" && 
       filteredNewAnnouncements.length === 0 && 
       Object.values(filteredByCategory).every(cat => cat.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No announcements match your search.
        </div>
      )}
      
      {/* Show message if specific category is selected but no matches */}
      {selectedCategory !== "all" && 
       selectedCategory !== "new" && 
       (!filteredByCategory[selectedCategory] || filteredByCategory[selectedCategory].length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No announcements found in {selectedCategory} category.
        </div>
      )}
      
      {/* Show message if "new" category is selected but no matches */}
      {selectedCategory === "new" && 
       filteredNewAnnouncements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No new announcements found.
        </div>
      )}
    </div>
  );
}