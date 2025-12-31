import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { EditUser } from "./Admin/EditUser";
import { DeleteUser } from "./Admin/DeleteUser";

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

interface UserActionsMenuProps {
  user: User;
  onEditSuccess?: () => void;
}

export function UserActionsMenu({ user, onEditSuccess }: UserActionsMenuProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditSuccess = () => {
    onEditSuccess?.();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
  };

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
          <DropdownMenuItem>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditUser
        user={user}
        onSuccess={handleEditSuccess}
      />
      <DeleteUser
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={user}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}