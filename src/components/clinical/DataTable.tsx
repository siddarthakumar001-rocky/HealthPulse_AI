import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Rows, StretchHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
  showDensityToggle?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No clinical records found.",
  className,
  stickyHeader = true,
  showDensityToggle = true,
}: DataTableProps<T>) {
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showDensityToggle && (
        <div className="flex justify-end gap-1 mb-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDensity(d => (d === "compact" ? "comfortable" : "compact"))}
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            title={`Toggle row density (currently ${density})`}
          >
            {density === "compact" ? (
              <StretchHorizontal className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Rows className="w-3.5 h-3.5 mr-1" />
            )}
            <span className="capitalize">{density}</span>
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface dark:bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px] relative scrollbar-thin">
          <Table className="w-full">
            <TableHeader className={cn(stickyHeader && "sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-sm")}>
              <TableRow className="border-b border-border hover:bg-transparent">
                {columns.map(col => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={keyExtractor(row, idx)}
                    className="border-b border-border/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map(col => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "text-sm font-sans",
                          density === "compact" ? "py-2" : "py-3.5",
                          col.align === "right" && "text-right font-mono",
                          col.align === "center" && "text-center",
                          col.className
                        )}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

