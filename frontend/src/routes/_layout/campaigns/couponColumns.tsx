import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponPublic } from "@/client";

export const couponColumns: ColumnDef<CouponPublic>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "discount_type",
    header: "Discount Type",
  },
  {
    accessorKey: "discount_value",
    header: "Discount Value",
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("discount_value"));
      return `${value}${row.getValue("discount_type") === "percentage" ? "%" : ""}`;
    },
  },
  {
    accessorKey: "assigned_to_user_id",
    header: "Assigned User",
    cell: ({ row }) => {
      const userId = row.getValue("assigned_to_user_id") as string | null;
      return userId ? "Assigned" : "Unassigned";
    },
  },
  {
    accessorKey: "redeemed",
    header: "Status",
    cell: ({ row }) => {
      const isRedeemed = row.getValue("redeemed") as boolean;
      const isAssigned = row.getValue("assigned_to_user_id") as string | null;
      
      let statusText = "Unassigned";
      let statusClass = "bg-gray-100 text-gray-800";
      
      if (isAssigned) {
        if (isRedeemed) {
          statusText = "Redeemed";
          statusClass = "bg-red-100 text-red-800";
        } else {
          statusText = "Assigned";
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
];