import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const useCouponColumns = (): ColumnDef<any>[] => {
  const { t } = useTranslation();

  return [
    {
      accessorKey: "campaign_title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 font-medium"
          >
            {t('campaigns.title')}
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
            {t('coupons.code')}
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
            {t('coupons.discount_type')}
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
            {t('coupons.discount_value')}
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
            {t('coupons.expires_at')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const expiresAt = row.getValue("expires_at") as string | null
        if (!expiresAt) {
          return (
            <span className="text-muted-foreground">{t('coupons.never')}</span>
          );
        }
        
        const date = new Date(expiresAt);
        const today = new Date();
        
        // Check if the coupon has expired
        const hasExpired = date < today;
        
        return (
          <div className={`text-sm ${hasExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
            {date.toLocaleDateString()} {hasExpired && `(${t('coupons.expired')})`}
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
            {t('common.status')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const redeemed = row.getValue("redeemed") as boolean;
        const assignedToUser = row.original.assigned_to_user_id;
        
        let statusText = t('coupons.available');
        let statusColor = "bg-gray-100 text-gray-800";
        
        if (redeemed) {
          statusText = t('coupons.redeemed');
          statusColor = "bg-destructive/20 text-destructive";
        } else if (assignedToUser) {
          statusText = t('coupons.assigned');
          statusColor = "bg-blue-100 text-blue-800";
        }
        
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        );
      },
    },
  ];
};