import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersService } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import { useUserColumns } from "@/components/Admin/columns";
import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/Sidebar/AppSidebar"
import useRoles from "@/hooks/useRoles";
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_layout/admin')({
  component: AdminRoute,
})

export function AdminRoute() {
  const { t } = useTranslation();
  const { hasRole, isLoading: rolesLoading } = useRoles();
  const isAdmin = hasRole("admin");
  const isManager = hasRole("manager");
  
  const columns = useUserColumns();

  // Fetch users only if user is admin
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error("Insufficient permissions");
      }
      const response = await UsersService.readUsers({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    enabled: isAdmin === true, // Only run query when we definitively know user is admin
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Ensure users is an array
  const usersArray = Array.isArray(users) ? users : [];



  if (rolesLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin && !isManager) {
    return <div>Access denied. Admin or Manager privileges required.</div>;
  }

  // Determine if we should show loading state for users
  const shouldShowUsersLoading = isAdmin === true && usersLoading;
  const shouldShowUsersError = isAdmin === true && usersError;



  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-6 p-6 pt-0 overflow-y-scroll bg-muted/10">
        <div className="flex-1 overflow-auto">
          <div className="space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('common.admin_dashboard', 'Admin Dashboard')}</h1>
                <p className="text-muted-foreground">{t('common.manage_users_and_announcements', 'Manage users and announcements')}</p>
              </div>
              <Button disabled={!isAdmin}>
                {t('common.add_user', 'Add User')}
              </Button>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users" disabled={!isAdmin}>Users</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('common.manage_users', 'Manage Users')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isAdmin === true ? (
                      shouldShowUsersLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Loading users...
                        </div>
                      ) : shouldShowUsersError ? (
                        <div className="text-center py-8 text-muted-foreground text-red-500">
                          Error loading users. Please try refreshing the page.
                        </div>
                      ) : (
                        <DataTable
                          columns={columns}
                          data={usersArray}
                        />
                      )
                    ) : isAdmin === false ? (
                      <div className="text-center py-8 text-muted-foreground">
                        User management is only available to administrators.
                      </div>
                    ) : (
                      // Still determining role
                      <div className="text-center py-8 text-muted-foreground">
                        Checking permissions...
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