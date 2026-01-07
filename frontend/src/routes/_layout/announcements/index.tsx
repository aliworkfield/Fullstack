import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AnnouncementsService, app__models__announcement__AnnouncementPublic } from "@/client";
import { GroupedAnnouncements } from '@/components/Announcements/GroupedAnnouncements';
import { CreateAnnouncementModal } from "@/components/Announcements/CreateAnnouncementModal";
import useRoles from "@/hooks/useRoles";

function Announcements() {
  const { hasRole } = useRoles()
  const isManagerOrAdmin = hasRole("admin") || hasRole("manager")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      let matchesStatus = true;
      if (statusFilter === "published") {
        matchesStatus = announcement.is_published === true;
      } else if (statusFilter === "drafts") {
        matchesStatus = announcement.is_published === false;
      } else if (statusFilter === "expired") {
        // Check if announcement is expired based on expiry_date field if available
        matchesStatus = announcement.expiry_date ? new Date(announcement.expiry_date) < new Date() : false;
      }
      
      return matchesStatus;
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
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-scroll">
        <div className="flex-1 overflow-auto">
          <div className='p-4'>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className='text-2xl font-bold'>Announcements</h1>
                <p className='text-muted-foreground'>Broadcast important messages</p>
              </div>
              {isManagerOrAdmin && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create Announcement
                </Button>
              )}
            </div>
            <div className='rounded-md border'>
              <div className="p-6">

                {isManagerOrAdmin ? (
                  <Tabs defaultValue="published" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="published">Published</TabsTrigger>
                      <TabsTrigger value="drafts">Drafts</TabsTrigger>
                      <TabsTrigger value="expired">Expired</TabsTrigger>
                    </TabsList>
                    <TabsContent value="published">
                      <GroupedAnnouncements 
                        announcements={publishedAnnouncements}
                      />
                    </TabsContent>
                    <TabsContent value="drafts">
                      <GroupedAnnouncements 
                        announcements={draftAnnouncements}
                      />
                    </TabsContent>
                    <TabsContent value="expired">
                      <GroupedAnnouncements 
                        announcements={expiredAnnouncements}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <GroupedAnnouncements 
                    announcements={allAnnouncements}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {isManagerOrAdmin && (
          <CreateAnnouncementModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </main>
    </SidebarProvider>
  )
}

export const Route = createFileRoute('/_layout/announcements/')({
  component: Announcements,
})