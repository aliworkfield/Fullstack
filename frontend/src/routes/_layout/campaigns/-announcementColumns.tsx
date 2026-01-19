import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { app__models__announcement__AnnouncementPublic } from "@/client";

export const announcementColumns: ColumnDef<app__models__announcement__AnnouncementPublic>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "is_published",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("is_published") as boolean;
      const expiryDate = row.getValue("expiry_date") as string | null;
      
      let statusText = "Draft";
      let statusClass = "bg-yellow-100 text-yellow-800";
      
      if (isPublished) {
        const now = new Date();
        const expiry = expiryDate ? new Date(expiryDate) : null;
        
        if (expiry && now > expiry) {
          statusText = "Expired";
          statusClass = "bg-red-100 text-red-800";
        } else {
          statusText = "Published";
          statusClass = "bg-green-100 text-green-800";
        }
      }
      
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
          {statusText}
        </span>
      );
    },
  },
  {
    accessorKey: "created_date",
    header: "Created Date",
    cell: ({ row }) => {
      const date = row.getValue("created_date") as string;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
];