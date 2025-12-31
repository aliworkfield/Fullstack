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
import { ItemsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

interface DeleteItemProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  onSuccess?: () => void;
}

export function DeleteItem({ 
  open, 
  onClose, 
  itemId, 
  itemName, 
  onSuccess 
}: DeleteItemProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const mutation = useMutation({
    mutationFn: (id: string) =>
      ItemsService.deleteItem({ id }),
    onSuccess: () => {
      showSuccessToast("Item deleted successfully");
      onClose();
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: handleError(showErrorToast),
  });

  const handleDelete = () => {
    mutation.mutate(itemId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{itemName}"? This action cannot be undone.
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