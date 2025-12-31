import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { ItemPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteItem } from "../Items/DeleteItem"
import { EditItem } from "../Items/EditItem"

interface ItemActionsMenuProps {
  item: ItemPublic
}

export const ItemActionsMenu = ({ item }: ItemActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditItem
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          item={item}
          onSuccess={() => {
            setIsEditOpen(false);
            setOpen(false);
          }}
        />
        <DeleteItem
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          itemId={item.id}
          itemName={item.title}
          onSuccess={() => {
            setIsDeleteOpen(false);
            setOpen(false);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
