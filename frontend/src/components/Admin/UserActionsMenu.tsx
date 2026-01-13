import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { EditUser } from "./EditUser";
import { DeleteUser } from "./DeleteUser";
import { UserPublic, UsersService } from "@/client";

interface UserActionsMenuProps {
  user: UserPublic;
  onEditSuccess?: () => void;
}

export function UserActionsMenu({ user, onEditSuccess }: UserActionsMenuProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditSuccess = () => {
    onEditSuccess?.();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async (userId: string) => {
    setIsDeleting(true);
    try {
      // Call the API to delete the user
      await UsersService.deleteUser({ userId });
      handleDeleteSuccess();
    } finally {
      setIsDeleting(false);
    }
  };

  // Render DeleteUser modal if needed
  const deleteUserModal = isDeleteModalOpen ? (
    <DeleteUser
      open={isDeleteModalOpen}
      onOpenChange={setIsDeleteModalOpen}
      user={user}
      onDelete={handleDelete}
      isDeleting={isDeleting}
    />
  ) : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <EditUser
            user={user}
            onSuccess={handleEditSuccess}
          />
          <DropdownMenuItem
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {deleteUserModal}
    </>
  );
}