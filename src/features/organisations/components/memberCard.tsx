// src/features/organisations/components/memberCard.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { MemberListItem } from "@/features/organisations/types/member.types";

interface MembersCardProps {
  data: { members: MemberListItem[]; total: number } | null;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
}

export const MembersCard = ({ data, page, perPage, onPageChange, isPending }: MembersCardProps) => {
  if (!data && isPending) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: perPage }).map((_, i) => (
          <div key={i} className="h-32 w-full rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.members.map((member: MemberListItem) => (
          <Card key={member.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{member.name}</p>
                <p className="truncate text-sm text-muted-foreground">{member.email}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span>{member.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span>{member.department ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">{member.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
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

