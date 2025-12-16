// src/features/organisations/components/memberTable.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { MemberListItem } from "@/features/organisations/types/member.types";
import { MemberColumn } from "@/features/organisations/constants/memberColumns";

interface MembersTableProps {
  data: { members: MemberListItem[]; total: number } | null;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
  visibleColumns: Record<MemberColumn, boolean>;
  onToggleColumn: (column: MemberColumn) => void;
}

export const MembersTable = ({ data, page, perPage, onPageChange, isPending, visibleColumns }: MembersTableProps) => {
  if (!data && isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.name && <TableHead>Name</TableHead>}
            {visibleColumns.email && <TableHead>Email</TableHead>}
            {visibleColumns.role && <TableHead>Role</TableHead>}
            {visibleColumns.department && <TableHead>Department</TableHead>}
            {visibleColumns.status && <TableHead>Status</TableHead>}
            {visibleColumns.joinedAt && <TableHead>Joined</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No members found
              </TableCell>
            </TableRow>
          ) : (
            data.members.map((m) => (
              <TableRow key={m.id} className="transition-colors hover:bg-muted/50">
                {visibleColumns.name && <TableCell className="font-medium">{m.name}</TableCell>}
                {visibleColumns.email && <TableCell>{m.email}</TableCell>}
                {visibleColumns.role && <TableCell>{m.role}</TableCell>}
                {visibleColumns.department && (
                  <TableCell>{m.department ?? "-"}</TableCell>
                )}
                {visibleColumns.status && (
                  <TableCell>
                    <Badge
                      variant={
                        m.status === "active"
                          ? "default"
                          : m.status === "invited"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.joinedAt && (  
                  <TableCell>{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page}
        </span>
        <Button
          variant="outline"
          disabled={page * perPage >= data.total}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
