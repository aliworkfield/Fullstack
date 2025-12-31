import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UsersService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";
import { useNavigate } from "@tanstack/react-router";

interface DeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteConfirmation({ open, onClose }: DeleteConfirmationProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const mutation = useMutation({
    mutationFn: () =>
      UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast("Account deleted successfully");
      queryClient.clear();
      navigate({ to: "/" });
      onClose();
    },
    onError: handleError(showErrorToast),
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
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
            {mutation.isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}