import { createFileRoute } from '@tanstack/react-router';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar/AppSidebar";
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCampaignsService, AdminCouponsService, AnnouncementsService, UsersService } from '@/client';
import { toast } from 'sonner';
import { Upload, Users, FileSpreadsheet, UserRound, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { DataTable } from '@/components/Common/DataTable';
import { couponColumns } from './couponColumns';
import { announcementColumns } from './announcementColumns';
import { CouponPublic } from '@/client';
import { app__schemas__user__UserPublic } from '@/client';
import { CampaignUpdate } from '@/client';

export const Route = createFileRoute('/_layout/campaigns/$id')({
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const queryClient = useQueryClient();

  // Fetch campaign data
  const { data: campaignData, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => AdminCampaignsService.getCampaign({ campaignId: id }),
    enabled: !!id,
  });

  // Mutation for updating campaign
  const updateCampaignMutation = useMutation({
    mutationFn: (data: CampaignUpdate) => 
      AdminCampaignsService.updateCampaign({
        campaignId: id,
        requestBody: data
      }),
    onSuccess: () => {
      toast.success('Campaign updated successfully');
      setEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: any) => {
      console.error('Error updating campaign:', error);
      toast.error(
        error?.response?.data?.detail || 
        error?.data?.detail || 
        "Failed to update campaign"
      );
    },
  });

  // Fetch campaign coupons
  const { data: couponsData, refetch: refetchCoupons } = useQuery({
    queryKey: ['campaign-coupons', id],
    queryFn: () => AdminCouponsService.getAllCoupons({ campaignId: id }),
    enabled: !!id,
  });

  // Fetch campaign announcements
  const { data: announcementsData } = useQuery({
    queryKey: ['campaign-announcements', id],
    queryFn: () => AnnouncementsService.readAnnouncements({ search: `campaign_id:${id}` }),
    enabled: !!id,
  });

  // Fetch all users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 1000 }),
  });

  const campaign = (campaignData as any)?.campaign;
  const coupons = (couponsData as any)?.data || [];
  const announcements = (announcementsData as any)?.data || [];
  const users = usersData?.data || [];

  const stats = {
    total: coupons.length,
    assigned: coupons.filter((c: CouponPublic) => c.assigned_user_id).length,
    unassigned: coupons.filter((c: CouponPublic) => !c.assigned_user_id).length,
    redeemed: coupons.filter((c: CouponPublic) => c.redeemed).length,
  };

  // State for edit form - moved before any conditional returns
  const [editFormData, setEditFormData] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    active: campaign?.active !== undefined ? campaign?.active : true,
  });

  // Handle Excel file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setExcelFile(file);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
      e.target.value = ''; // Clear the file input
    }
  };

  // Upload coupons from Excel
  const handleUpload = async () => {
    if (!excelFile) {
      toast.error('Please select an Excel file');
      return;
    }

    try {
      // In a real implementation, we would send the file to the backend
      // For now, we'll simulate the upload
      toast.success('Coupons uploaded successfully');
      setUploadModalOpen(false);
      setExcelFile(null);
      refetchCoupons();
    } catch (error) {
      console.error('Error uploading coupons:', error);
      toast.error('Failed to upload coupons');
    }
  };

  // Assign coupon to user
  const handleAssignCoupon = async () => {
    if (!selectedCouponId || !selectedUserId) {
      toast.error('Please select both coupon and user');
      return;
    }

    try {
      // Call the API to assign the coupon to the user
      await AdminCouponsService.assignCouponToUser({
        couponId: selectedCouponId,
        userId: selectedUserId
      });
      toast.success('Coupon assigned successfully');
      setAssignModalOpen(false);
      setSelectedCouponId(null);
      setSelectedUserId(null);
      refetchCoupons();
    } catch (error) {
      console.error('Error assigning coupon:', error);
      toast.error('Failed to assign coupon');
    }
  };

  // Auto-assign unassigned coupons to users
  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      await AdminCouponsService.assignCampaignToAllUsers({ campaignId: id });
      toast.success('Coupons auto-assigned successfully');
      refetchCoupons();
    } catch (error) {
      console.error('Error auto-assigning coupons:', error);
      toast.error('Failed to auto-assign coupons');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCampaignMutation.mutate(editFormData);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEditFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };



  // Update editFormData when campaign changes to ensure form is pre-populated
  useEffect(() => {
    if (campaign) {
      setEditFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        active: campaign.active !== undefined ? campaign.active : true,
      });
    }
  }, [campaign]);

    // Conditional renders - all hooks are called before this point
  if (campaignLoading) {
    return <div>Loading campaign...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }


  // -----------

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-scroll">
        <div className="flex-1 overflow-auto">
          <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{campaign.title}</h1>
                <p className="text-muted-foreground">{campaign.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setEditModalOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Campaign
                </Button>
                <Button 
                  onClick={() => setUploadModalOpen(true)}
                  variant="outline"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Coupons (Excel)
                </Button>
                <Button 
                  onClick={handleAutoAssign}
                  disabled={isAutoAssigning || stats.unassigned === 0}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {isAutoAssigning ? 'Assigning...' : 'Auto-assign Coupons'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.assigned}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.unassigned}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.redeemed}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="coupons" className="space-y-4">
              <TabsList>
                <TabsTrigger value="coupons">Coupons ({coupons.length})</TabsTrigger>
                <TabsTrigger value="announcements">Announcements ({announcements.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="coupons" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Coupon Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex justify-end">
                      <Button 
                        onClick={() => setAssignModalOpen(true)}
                        disabled={stats.unassigned === 0}
                      >
                        Assign Coupon to User
                      </Button>
                    </div>
                    <DataTable 
                      columns={couponColumns} 
                      data={coupons} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="announcements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Related Announcements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable 
                      columns={announcementColumns} 
                      data={announcements} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Edit Campaign Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      type="text"
                      value={editFormData.description}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="datetime-local"
                      value={editFormData.start_date}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="datetime-local"
                      value={editFormData.end_date}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      checked={editFormData.active}
                      onChange={handleEditChange}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateCampaignMutation.isPending}
                    >
                      {updateCampaignMutation.isPending ? "Updating..." : "Update Campaign"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Upload Coupons Modal */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Coupons via Excel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="excel-upload">Excel File</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input 
                        id="excel-upload" 
                        type="file" 
                        accept=".xlsx,.xls" 
                        onChange={handleFileChange}
                      />
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Excel format: code, user_id (optional)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUploadModalOpen(false);
                      setExcelFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={!excelFile}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assign Coupon Modal */}
            <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Coupon to User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="coupon-select">Select Coupon</Label>
                    <select
                      id="coupon-select"
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                      value={selectedCouponId || ''}
                      onChange={(e) => setSelectedCouponId(e.target.value)}
                    >
                      <option value="">Select a coupon</option>
                      {coupons
                        .filter((coupon: CouponPublic) => !coupon.assigned_user_id)
                        .map((coupon: CouponPublic) => (
                          <option key={coupon.id} value={coupon.id}>
                            {coupon.code} ({coupon.discount_value} {coupon.discount_type})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <select
                      id="user-select"
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                      value={selectedUserId || ''}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                      <option value="">Select a user</option>
                      {users.map((user: app__schemas__user__UserPublic) => (
                        <option key={user.id} value={user.id}>
                          {user.email} ({user.full_name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAssignModalOpen(false);
                      setSelectedCouponId(null);
                      setSelectedUserId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAssignCoupon} disabled={!selectedCouponId || !selectedUserId}>
                    <UserRound className="mr-2 h-4 w-4" />
                    Assign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}