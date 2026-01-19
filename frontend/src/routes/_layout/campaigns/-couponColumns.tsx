import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponPublic } from "@/client";

export const getCouponColumns = (t: (key: string, defaultValue: string) => string): ColumnDef<CouponPublic>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('columns.code', 'Code')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "discount_type",
    header: t('columns.discount_type', 'Discount Type'),
  },
  {
    accessorKey: "discount_value",
    header: t('columns.discount_value', 'Discount Value'),
    cell: ({ row }) => {
      const value = parseFloat(row.getValue("discount_value"));
      return `${value}${row.getValue("discount_type") === "percentage" ? "%" : ""}`;
    },
  },
  {
    accessorKey: "assigned_to_user_id",
    header: t('columns.assigned_user', 'Assigned User'),
    cell: ({ row }) => {
      const userId = row.getValue("assigned_to_user_id") as string | null;
      return userId ? t('columns.assigned', 'Assigned') : t('columns.unassigned', 'Unassigned');
    },
  },
  {
    accessorKey: "redeemed",
    header: t('columns.status', 'Status'),
    cell: ({ row }) => {
      const isRedeemed = row.getValue("redeemed") as boolean;
      const isAssigned = row.getValue("assigned_to_user_id") as string | null;
      
      let statusText = t('columns.unassigned', 'Unassigned');
      let statusClass = "bg-gray-100 text-gray-800";
      
      if (isAssigned) {
        if (isRedeemed) {
          statusText = t('columns.redeemed', 'Redeemed');
          statusClass = "bg-red-100 text-red-800";
        } else {
          statusText = t('columns.assigned', 'Assigned');
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