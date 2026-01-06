import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CampaignsService } from "@/client";

interface CreateCampaignInput {
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  active?: boolean;
}

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCampaignModal({ open, onClose }: CreateCampaignModalProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    active: true,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateCampaignInput) => 
      CampaignsService.createCampaignEndpoint({ 
        requestBody: {
          title: data.title,  // Use the API field name 'title' as expected by CampaignCreate
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          active: data.active,
        }
      }).then((response) => response),  // Type assertion since return type may vary
    onSuccess: () => {
      toast.success("Campaign created successfully");
      onClose();
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        active: true,
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: any) => {
      console.error("Error creating campaign:", error);
      toast.error(
        error?.response?.data?.detail || 
        error?.data?.detail || 
        "Failed to create campaign"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name === 'name' ? 'title' : name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}