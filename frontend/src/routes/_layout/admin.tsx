import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersService, app__models__announcement__AnnouncementPublic } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import { columns } from "@/components/Admin/columns";
import { AnnouncementsByCategory } from "@/components/Announcements/AnnouncementsByCategory";
import { AnnouncementsService } from "@/client";
import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"

export const Route = createFileRoute('/_layout/admin')({
  component: AdminRoute,
})

export function AdminRoute() {
  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UsersService.readUsers({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const response = await AnnouncementsService.readAnnouncements({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Group announcements by category
  const groupedAnnouncements: Record<string, app__models__announcement__AnnouncementPublic[]> = {};
  announcements.forEach((announcement: app__models__announcement__AnnouncementPublic) => {
    if (!groupedAnnouncements[announcement.category]) {
      groupedAnnouncements[announcement.category] = [];
    }
    groupedAnnouncements[announcement.category].push(announcement);
  });

  // Map users to have string IDs to match the expected type
  const mappedUsers = users.map(user => ({
    ...user,
    id: user.id.toString()
  }));

  if (usersLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-scroll">
        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <Button disabled={true}>
                Add User
              </Button>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={mappedUsers}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="announcements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Announcements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(groupedAnnouncements).map(([category, announcements]) => (
                      <AnnouncementsByCategory
                        key={category}
                        category={category}
                        title={category}
                        announcements={announcements}
                      />
                    ))}
                    {Object.keys(groupedAnnouncements).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No announcements found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}