import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowSelectionChange?: (selectedRowIds: string[]) => void
  selectedRowIds?: string[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  selectedRowIds = [],
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection: Object.fromEntries(selectedRowIds.map(id => [id, true])),
    },
    onRowSelectionChange: (updater) => {
      if (onRowSelectionChange) {
        const newRowSelections = typeof updater === 'function' ? updater(table.getState().rowSelection) : updater;
        const selectedIds = Object.keys(newRowSelections);
        onRowSelectionChange(selectedIds);
      }
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => (row as any).id,
  })

  return (
    <div className="flex flex-col gap-4">
      <Table className="border rounded-md">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b hover:bg-accent/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground border-t"
              >
                {t('common.no_results_found', 'No results found.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {t('common.showing_text', 'Showing')}{' '}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{' '}
              {t('common.to_text', 'to')}{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                data.length,
              )}{' '}
              {t('common.of_text', 'of')}{' '}
              <span className="font-medium text-foreground">{data.length}</span>{' '}
              {t('common.entries_text', 'entries')}
            </div>
            <div className="flex items-center gap-x-2">
              <p className="text-sm text-muted-foreground">{t('common.rows_per_page', 'Rows per page')}</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 25, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-x-6">
            <div className="flex items-center gap-x-1 text-sm text-muted-foreground">
              <span>{t('common.page_text', 'Page')}</span>
              <span className="font-medium text-foreground">
                {table.getState().pagination.pageIndex + 1}
              </span>
              <span>{t('common.of_text', 'of')}</span>
              <span className="font-medium text-foreground">
                {table.getPageCount()}
              </span>
            </div>

            <div className="flex items-center gap-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">{t('common.go_to_first_page', 'Go to first page')}</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">{t('common.go_to_previous_page', 'Go to previous page')}</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">{t('common.go_to_next_page', 'Go to next page')}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">{t('common.go_to_last_page', 'Go to last page')}</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
