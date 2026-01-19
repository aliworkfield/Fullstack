import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { useTranslation } from 'react-i18next'

// Note: For translations in columns, we'll need to pass t function from parent component

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

export const useCampaignColumns = (): ColumnDef<CampaignWithStats>[] => {
  const { t } = useTranslation();

  return [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('datatable.headers.title', 'Title')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <Link 
            to="/campaigns/$id" 
            params={{ id: row.original.id }} 
            className="text-blue-600 hover:underline font-medium"
          >
            {row.original.title}
          </Link>
        )
      },
    },
    {
      accessorKey: "description",
      header: () => {
        return t('datatable.headers.description', 'Description');
      },
    },
    {
      accessorKey: "total_coupons",
      header: () => {
        return t('datatable.headers.total_coupons', 'Total Coupons');
      },
      cell: ({ row }) => {
        return row.original.total_coupons || 0;
      }
    },
    {
      accessorKey: "assigned_coupons",
      header: () => {
        return t('datatable.headers.assigned_coupons', 'Assigned Coupons');
      },
      cell: ({ row }) => {
        return row.original.assigned_coupons || 0;
      }
    },
    {
      accessorKey: "unassigned_coupons",
      header: () => {
        return t('datatable.headers.unassigned_coupons', 'Unassigned Coupons');
      },
      cell: ({ row }) => {
        return row.original.unassigned_coupons || 0;
      }
    },
    {
      accessorKey: "active",
      header: () => {
        return t('datatable.headers.status', 'Status');
      },
      cell: ({ row }) => {
        const active = row.getValue("active") as boolean
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {active ? t('campaigns.active', 'Active') : t('campaigns.inactive', 'Inactive')}
          </span>
        )
      },
    },
  ];
}