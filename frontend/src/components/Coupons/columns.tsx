import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "campaign_title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 font-medium"
        >
          Campaign
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const campaignTitle = row.getValue("campaign_title") as string;
      return (
        <div className="font-medium">
          {campaignTitle}
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 font-medium"
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return (
        <div className="font-mono text-sm font-medium text-primary">
          {code}
        </div>
      );
    },
  },
  {
    accessorKey: "discount_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 font-medium"
        >
          Discount Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("discount_type") as string;
      return (
        <div className="capitalize">
          {type}
        </div>
      );
    },
  },
  {
    accessorKey: "discount_value",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 font-medium"
        >
          Discount Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("discount_type") as string
      const value = row.getValue("discount_value") as number
      return (
        <div className="font-medium">
          {type === "percentage" ? (
            <span className="text-emerald-600">{value}%</span>
          ) : (
            <span className="text-emerald-600">${value}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "expires_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 font-medium"
        >
          Expires At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const expiresAt = row.getValue("expires_at") as string | null
      if (!expiresAt) {
        return (
          <span className="text-muted-foreground">Never</span>
        );
      }
      
      const date = new Date(expiresAt);
      const today = new Date();
      
      // Check if the coupon has expired
      const hasExpired = date < today;
      
      return (
        <div className={`text-sm ${hasExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
          {date.toLocaleDateString()} {hasExpired && '(Expired)'}
        </div>
      );
    },
  },
  {
    accessorKey: "redeemed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 font-medium"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const redeemed = row.getValue("redeemed") as boolean;
      const assignedToUser = row.original.assigned_to_user_id;
      
      let statusText = "Available";
      let statusColor = "bg-gray-100 text-gray-800";
      
      if (redeemed) {
        statusText = "Redeemed";
        statusColor = "bg-destructive/20 text-destructive";
      } else if (assignedToUser) {
        statusText = "Assigned";
        statusColor = "bg-blue-100 text-blue-800";
      }
      
      return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
          {statusText}
        </span>
      );
    },
  },
]