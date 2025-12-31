import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemsService, ItemPublic } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import { columns } from "@/components/Items/columns";
import { AddItem } from "@/components/Items/AddItem";
import { EditItem } from "@/components/Items/EditItem";
import { DeleteItem } from "@/components/Items/DeleteItem";

export function ItemsRoute() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemPublic | null>(null);
  const [deleteItem, setDeleteItem] = useState<ItemPublic | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await ItemsService.readItems({
        skip: 0,
        limit: 100,
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Items</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={items}
          />
        </CardContent>
      </Card>

      <AddItem
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {}}
      />
      <EditItem
        open={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem!}
        onSuccess={() => setEditItem(null)}
      />
      <DeleteItem
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        itemId={deleteItem?.id || ""}
        itemName={deleteItem?.title || ""}
        onSuccess={() => setDeleteItem(null)}
      />
    </div>
  );
}