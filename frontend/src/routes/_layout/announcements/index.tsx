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
  const filterAnnouncements = (announcements: app__models__announcement__AnnouncementPublic[], statusFilter?: string) => {
    return announcements.filter(announcement => {
      let matchesStatus = true;
      const isExpired = announcement.expiry_date ? new Date(announcement.expiry_date) < new Date() : false;
      
      if (statusFilter === "published") {
        // Published and not expired
        matchesStatus = announcement.is_published === true && !isExpired;
      } else if (statusFilter === "drafts") {
        // Not published
        matchesStatus = announcement.is_published === false;
      } else if (statusFilter === "expired") {
        // Published and expired
        matchesStatus = announcement.is_published === true && isExpired;
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
      <main className="flex flex-1 flex-col gap-6 p-6 pt-0 overflow-y-scroll bg-muted/10">
        <div className="flex-1 overflow-auto">
          <div className='max-w-7xl mx-auto w-full'>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>Announcements</h1>
                <p className='text-muted-foreground'>Broadcast important messages and updates</p>
              </div>
              {isManagerOrAdmin && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create Announcement
                </Button>
              )}
            </div>
            <div className='rounded-xl border bg-card shadow-sm'>
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