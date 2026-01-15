"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalRows?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalRows,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostra todas as páginas se houver poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Ajusta se estiver no início
      if (currentPage <= 3) {
        end = 4;
      }

      // Ajusta se estiver no fim
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Adiciona ellipsis antes se necessário
      if (start > 2) {
        pages.push("ellipsis-start");
      }

      // Adiciona páginas do meio
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Adiciona ellipsis depois se necessário
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Sempre mostra última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="text-sm text-muted-foreground">
        {totalRows !== undefined && pageSize !== undefined ? (
          <>
            Mostrando{" "}
            <span className="font-medium">
              {Math.min((currentPage - 1) * pageSize + 1, totalRows)}
            </span>{" "}
            até{" "}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalRows)}
            </span>{" "}
            de <span className="font-medium">{totalRows}</span> resultados
          </>
        ) : (
          <>
            Página <span className="font-medium">{currentPage}</span> de{" "}
            <span className="font-medium">{totalPages}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <Button
                  key={`ellipsis-${index}`}
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            const pageNum = page as number;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-10",
                  currentPage === pageNum && "bg-primary text-primary-foreground"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima página</span>
        </Button>
      </div>
    </div>
  );
}
