import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define a type that includes coupon statistics
interface CampaignWithStats {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  active: boolean;
  created_at: string;
  total_coupons?: number;
  assigned_coupons?: number;
  unassigned_coupons?: number;
}

export const columns: ColumnDef<CampaignWithStats>[] = [
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
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "total_coupons",
    header: "Total Coupons",
    cell: ({ row }) => {
      return row.original.total_coupons || 0;
    }
  },
  {
    accessorKey: "assigned_coupons",
    header: "Assigned Coupons",
    cell: ({ row }) => {
      return row.original.assigned_coupons || 0;
    }
  },
  {
    accessorKey: "unassigned_coupons",
    header: "Unassigned Coupons",
    cell: ({ row }) => {
      return row.original.unassigned_coupons || 0;
    }
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          active 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {active ? "Active" : "Inactive"}
        </span>
      )
    },
  },
]