import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPublic } from "@/client";

interface DeleteUserProps {
  user: UserPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (userId: string) => void;
  isDeleting: boolean;
}

export function DeleteUser({ user, open, onOpenChange, onDelete, isDeleting }: DeleteUserProps) {
  const handleDelete = () => {
    onDelete(user.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user <strong>{user.email}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}