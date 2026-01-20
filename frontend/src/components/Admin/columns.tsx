import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserPublic } from "@/client";
import { UserActionsMenu } from "./UserActionsMenu";
import { useTranslation } from 'react-i18next';

export const useUserColumns = (): ColumnDef<UserPublic>[] => {
  const { t } = useTranslation();

  return [
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('users.email', 'Email')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "full_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('common.full_name', 'Full Name')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('common.status', 'Status')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}>
            {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
          </span>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('users.role', 'Role')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        let badgeColor = "bg-blue-100 text-blue-800";
        if (role === "admin") badgeColor = "bg-purple-100 text-purple-800";
        if (role === "manager") badgeColor = "bg-amber-100 text-amber-800";

        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <UserActionsMenu
            user={{
              id: user.id,
              email: user.email,
              full_name: user.full_name || null,
            }}
            onEditSuccess={() => { }} // Implement actual success callback as needed
          />
        );
      },
    },
  ];
};