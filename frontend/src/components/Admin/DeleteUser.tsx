import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { app__models__user__UserPublic as UserPublic } from "@/client";
import { UsersService } from "@/client";

interface DeleteUserProps {
  open: boolean;
  onClose: () => void;
  user: UserPublic;
  onSuccess?: () => void;
}

export function DeleteUser({ open, onClose, user, onSuccess }: DeleteUserProps) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (id: string) => 
      UsersService.deleteUser({ userId: id }),
    onSuccess: () => {
      toast.success("User deleted successfully");
      onClose();
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Error deleting user:", error);
      toast.error(
        error?.response?.data?.detail || 
        error?.data?.detail || 
        "Failed to delete user"
      );
    },
  });

  const handleDelete = () => {
    mutation.mutate(user.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user "{user.email}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}