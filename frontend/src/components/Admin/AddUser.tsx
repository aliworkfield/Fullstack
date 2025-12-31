import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PrivateService } from "@/client";

interface AddUserProps {
  open: boolean;
  onClose: () => void;
}

export function AddUser({ open, onClose }: AddUserProps) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (userData: { email: string; full_name: string }) => 
      PrivateService.createUser({
        requestBody: {
          email: userData.email,
          full_name: userData.full_name,
        }
      }),
    onSuccess: () => {
      toast.success("User created successfully");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);
      toast.error(
        error?.response?.data?.detail || 
        error?.data?.detail || 
        "Failed to create user"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const full_name = formData.get("full_name") as string;
    
    mutation.mutate({ email, full_name });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Add a new user to the system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" type="text" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}