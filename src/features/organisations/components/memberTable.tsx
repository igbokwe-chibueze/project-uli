// src/features/organisations/components/memberTable.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MemberListItem } from "@/types/organisations/member.types";

interface MembersTableProps {
  data: { members: MemberListItem[]; total: number } | null;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
}

export const MembersTable = ({ data, page, perPage, onPageChange, isPending }: MembersTableProps) => {
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
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
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
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>{m.department ?? "-"}</TableCell>
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
                <TableCell>{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
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
