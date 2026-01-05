import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnnouncementsService, app__schemas__announcement__AnnouncementUpdate, app__models__announcement__AnnouncementPublic } from "@/client";
import { toast } from "sonner";

interface EditAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: app__models__announcement__AnnouncementPublic;
  onSuccess?: () => void;
}

export function EditAnnouncementModal({ 
  open, 
  onOpenChange, 
  announcement,
  onSuccess 
}: EditAnnouncementModalProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<app__schemas__announcement__AnnouncementUpdate>({
    title: announcement.title || "",
    description: announcement.description || null,
    category: announcement.category || "",
    requires_coupon: announcement.requires_coupon || false,
    campaign_id: announcement.campaign_id || null,
    is_published: announcement.is_published || false,
    publish_date: announcement.publish_date || null,
    expires_at: announcement.expiry_date || null, // Using expiry_date from the model
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        description: announcement.description || null,
        category: announcement.category || "",
        requires_coupon: announcement.requires_coupon || false,
        campaign_id: announcement.campaign_id || null,
        is_published: announcement.is_published || false,
        publish_date: announcement.publish_date || null,
        expires_at: announcement.expiry_date || null, // Using expiry_date from the model
      });
    }
  }, [announcement]);

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; requestBody: app__schemas__announcement__AnnouncementUpdate }) => {
      return AnnouncementsService.updateAnnouncementEndpoint({
        id: data.id,
        requestBody: data.requestBody
      });
    },
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement", announcement.id] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating announcement:", error);
      toast.error("Failed to update announcement");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: announcement.id, requestBody: formData });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'requires_coupon' || name === 'is_published' ? Boolean(val) : val
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requires_coupon"
              name="requires_coupon"
              checked={!!formData.requires_coupon}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <Label htmlFor="requires_coupon">Requires Coupon</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={!!formData.is_published}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <Label htmlFor="is_published">Is Published</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}