import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { AnnouncementsByCategory } from '@/components/Announcements/AnnouncementsByCategory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AnnouncementsService, app__models__announcement__AnnouncementPublic } from "@/client";
import { AnnouncementsTable } from "@/components/Announcements/AnnouncementsTable";
import { CreateAnnouncementModal } from "@/components/Announcements/CreateAnnouncementModal";
import useRoles from "@/hooks/useRoles";

export function AnnouncementsRoute() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const response = await AnnouncementsService.readPublishedAnnouncements({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Announcement
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search announcements..."
          className="pl-9"
        />
      </div>

      <AnnouncementsTable announcements={announcements} />

      <CreateAnnouncementModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export const Route = createFileRoute('/_layout/announcements/')({
  component: Announcements,
})

function Announcements() {
  const { hasRole } = useRoles()
  const isManagerOrAdmin = hasRole("admin") || hasRole("manager")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Fetch announcements based on user role
  const { data: allAnnouncements = [], isLoading } = useQuery({
    queryKey: ["announcements", isManagerOrAdmin ? "all" : "published"],
    queryFn: async () => {
      if (isManagerOrAdmin) {
        const response = await AnnouncementsService.readAnnouncements({
          skip: 0,
          limit: 100,
        });
        return response.data || [];
      } else {
        const response = await AnnouncementsService.readPublishedAnnouncements({
          skip: 0,
          limit: 100,
        });
        return response.data || [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter announcements based on category and search
  const filterAnnouncements = (_: app__models__announcement__AnnouncementPublic[], statusFilter?: string) => {
    return allAnnouncements.filter(announcement => {
      const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (announcement.description && announcement.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesStatus = true;
      if (statusFilter === "published") {
        matchesStatus = announcement.is_published === true;
      } else if (statusFilter === "drafts") {
        matchesStatus = announcement.is_published === false;
      } else if (statusFilter === "expired") {
        // Check if announcement is expired based on expiry_date field if available
        matchesStatus = announcement.expiry_date ? new Date(announcement.expiry_date) < new Date() : false;
      }
      
      return matchesCategory && matchesSearch && matchesStatus;
    });
  };

  const publishedAnnouncements = filterAnnouncements(allAnnouncements, "published");
  const draftAnnouncements = filterAnnouncements(allAnnouncements, "drafts");
  const expiredAnnouncements = filterAnnouncements(allAnnouncements, "expired");

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex-1 overflow-auto">
          <div className='p-4'>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className='text-2xl font-bold'>Announcements</h1>
                <p className='text-muted-foreground'>Broadcast important messages</p>
              </div>
            </div>
            <div className='rounded-md border'>
              <div className="p-6">
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search announcements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-48">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {isManagerOrAdmin ? (
                  <Tabs defaultValue="published" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="published">Published</TabsTrigger>
                      <TabsTrigger value="drafts">Drafts</TabsTrigger>
                      <TabsTrigger value="expired">Expired</TabsTrigger>
                    </TabsList>
                    <TabsContent value="published">
                      <AnnouncementsByCategory 
                        category={selectedCategory} 
                        title="Published Announcements" 
                        announcements={publishedAnnouncements}
                      />
                    </TabsContent>
                    <TabsContent value="drafts">
                      <AnnouncementsByCategory 
                        category={selectedCategory} 
                        title="Draft Announcements" 
                        announcements={draftAnnouncements}
                      />
                    </TabsContent>
                    <TabsContent value="expired">
                      <AnnouncementsByCategory 
                        category={selectedCategory} 
                        title="Expired Announcements" 
                        announcements={expiredAnnouncements}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <AnnouncementsByCategory 
                    category={selectedCategory} 
                    title="All Announcements" 
                    announcements={allAnnouncements}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}