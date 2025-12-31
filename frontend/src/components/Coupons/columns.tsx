import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CouponPublic } from "@/client/types.gen"

export const columns: ColumnDef<CouponPublic>[] = [
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
      )
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
      const type = row.getValue("discount_type") as string
      const value = row.getValue("discount_value") as number
      return (
        <span>
          {type === "percentage" ? `${value}%` : `$${value}`}
        </span>
      )
    },
  },
  {
    accessorKey: "expires_at",
    header: "Expires At",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expires_at") as string | null
      return expiresAt ? new Date(expiresAt).toLocaleDateString() : "Never"
    },
  },
  {
    accessorKey: "redeemed",
    header: "Status",
    cell: ({ row }) => {
      const redeemed = row.getValue("redeemed") as boolean
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          redeemed 
            ? "bg-red-100 text-red-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {redeemed ? "Redeemed" : "Available"}
        </span>
      )
    },
  },
]