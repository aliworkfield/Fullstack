import { ColumnDef } from "@tanstack/react-table";
import { app__models__announcement__AnnouncementPublic } from "@/client";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

// Note: For translations in columns, we'll need to pass t function from parent component
export const columns: ColumnDef<app__models__announcement__AnnouncementPublic>[] = [

  {
    accessorKey: "title",
    header: ({ column }) => {
      // Translation function should be passed from parent component
      const t = (_key: string, fallback: string) => fallback;
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('datatable.headers.title', 'Title')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => {
      // Translation function should be passed from parent component
      const t = (_key: string, fallback: string) => fallback;
      return t('datatable.headers.category', 'Category');
    },
  },
  {
    accessorKey: "created_date",
    header: () => {
      // Translation function should be passed from parent component
      const t = (_key: string, fallback: string) => fallback;
      return t('datatable.headers.created_date', 'Created Date');
    },
    cell: ({ row }) => {
      const date = row.getValue("created_date") as string | null;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "is_published",
    header: () => {
      // Translation function should be passed from parent component
      const t = (_key: string, fallback: string) => fallback;
      return t('datatable.headers.status', 'Status');
    },
    cell: ({ row }) => {
      // Translation function should be passed from parent component
      const t = (_key: string, fallback: string) => fallback;
      const isPublished = row.getValue("is_published") as boolean;
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isPublished 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {isPublished ? t('announcements.published', 'Published') : t('announcements.draft', 'Draft')}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // Translation function should be passed from parent component
      const t = (_key: string, fallback: string) => fallback;
      const announcement = row.original;
      const navigate = useNavigate();
      
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ 
            to: '/announcements/$id', 
            params: { id: announcement.id } 
          })}
        >
          {t('common.view', 'View')}
        </Button>
      );
    },
  },
];