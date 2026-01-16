import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { app__models__announcement__AnnouncementPublic } from "@/client";
import { Link } from "@tanstack/react-router";

interface GroupedAnnouncementsProps {
  announcements: app__models__announcement__AnnouncementPublic[];
}

export function GroupedAnnouncements({ announcements }: GroupedAnnouncementsProps) {
  const { t } = useTranslation();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('announcements.title', 'Announcements')}</h1>
          {/* <p className="text-muted-foreground mt-1">Important updates and notifications</p> */}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm min-w-[180px]"
          >
            <option value="all">{t('common.all_categories', 'All Categories')}</option>
            <option value="new">{t('common.new', 'New')}</option>
            {sortedCategories.map(category => (
              <option key={`cat-opt-${category}`} value={category}>{t(`announcements.categories.${category.toLowerCase()}`, category)}</option>
            ))}
          </select>
          <div className="relative">
            <Input
              placeholder={t('common.search_announcements', 'Search announcements...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
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
            <h2 className="text-xl font-bold text-blue-600">{t('common.new', 'New')}</h2>
            <Badge variant="secondary">{filteredNewAnnouncements.length}</Badge>
          </div>
          
          {expandedCategories['new'] !== false && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNewAnnouncements.map((announcement) => (
                <Link 
                  key={`new-${announcement.id}`} 
                  to="/announcements/$id"
                  params={{ id: announcement.id }}
                  className="border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer bg-card hover:bg-accent"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-lg truncate">{announcement.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {announcement.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{new Date(announcement.created_date || '').toLocaleDateString()}</span>
                    <span className="capitalize">{announcement.category}</span>
                  </div>
                </Link>
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
              <h2 className="text-xl font-bold">{category === 'new' ? t('common.new', 'New') : category}</h2>
              <Badge variant="outline">{categoryAnnouncements.length}</Badge>
            </div>
            
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAnnouncements.map((announcement) => (
                  <Link 
                    key={`cat-${announcement.id}`} 
                    to="/announcements/$id"
                    params={{ id: announcement.id }}
                    className="border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer bg-card hover:bg-accent"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-lg truncate">{announcement.title}</h3>
                      {new Date(announcement.created_date || '') > tenDaysAgo && (
                        <Badge variant="secondary" className="text-xs">
                          {t('common.new', 'New')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {announcement.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{new Date(announcement.created_date || '').toLocaleDateString()}</span>
                      <span className="capitalize">{announcement.category}</span>
                    </div>
                  </Link>
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
          {t('announcements.no_match', 'No announcements match your search.')}
        </div>
      )}
      
      {/* Show message if specific category is selected but no matches */}
      {selectedCategory !== "all" && 
       selectedCategory !== "new" && 
       (!filteredByCategory[selectedCategory] || filteredByCategory[selectedCategory].length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          {t('announcements.no_in_category', 'No announcements found in {{category}} category.', { category: selectedCategory })}
        </div>
      )}
      
      {/* Show message if "new" category is selected but no matches */}
      {selectedCategory === "new" && 
       filteredNewAnnouncements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t('announcements.no_new', 'No new announcements found.')}
        </div>
      )}
    </div>
  );
}