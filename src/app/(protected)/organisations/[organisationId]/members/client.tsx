// src/app/(protected)/organisations/[organisationId]/members/client.tsx

'use client';

import { OrgRole } from "@prisma/client";
import { useState, useEffect, useTransition } from "react";
import { ChevronDownIcon, ColumnsIcon, LayoutGridIcon, ListIcon, ShareIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MembersCard } from "@/features/organisations/components/memberCard";
import { MemberListItem } from "@/features/organisations/types/member.types";
import { MembersTable } from "@/features/organisations/components/memberTable";
import { getMembersAction } from "@/features/organisations/actions/getMembersAction";
import { InviteMembersModal } from "@/features/organisations/components/inviteMembersModal";
import { MEMBER_COLUMNS, MemberColumn } from "@/features/organisations/constants/memberColumns";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RoleData {
  options: OrgRole[];
  default: OrgRole;
}

interface MembersClientProps {
  organisationId: string;
  roleData: RoleData;
}

type ViewMode = "table" | "card";

export const MembersClient = ({ organisationId, roleData }: MembersClientProps) => {
  const [view, setView] = useState<ViewMode>("table");

  // Filters and pagination
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<OrgRole | undefined>(undefined);

  // Fetched members data
  const [data, setData] = useState<{ members: MemberListItem[]; total: number } | null>(null);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);

  const [isPending, startTransition] = useTransition();

  // 🔑 Column visibility map
  const [visibleColumns, setVisibleColumns] = useState<
    Record<MemberColumn, boolean>
  >({
    name: true,
    email: true,
    role: true,
    department: true,
    status: true,
    joinedAt: true,
  });

  // -------------------------------
  // Fetch members whenever filters/page change
  // -------------------------------
  useEffect(() => {
    startTransition(async () => {
      const res = await getMembersAction({
        orgId: organisationId,
        page,
        perPage,
        search,
        role,
      });
      setData(res);
    });
  }, [organisationId, page, perPage, search, role]);

  return (
    <>
      {/* Invite modal */}
      <InviteMembersModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        organisationId={organisationId}
        roleData={roleData}
        //onInviteSuccess={fetchMembers} // refresh list after invite
      />

      <div className="space-y-4">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                startTransition(() => {
                  setSearch(value);
                  setPage(1); // reset pagination
                });
              }}
              className="max-w-sm"
            />

            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value as OrgRole);
                setPage(1); // reset pagination
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roleData.options.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  <ColumnsIcon className="mr-2 size-4"/>
                  Columns
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {MEMBER_COLUMNS.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col}
                    checked={visibleColumns[col]}
                    onCheckedChange={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col],
                      }))
                    }
                  >
                    {col}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="table">
                  <ListIcon className="size-4 mr-1" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="card">
                  <LayoutGridIcon className="size-4 mr-1" />
                  Cards
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" onClick={() => setInviteOpen(true)}>
              <ShareIcon className="size-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>

        {/* Content */}
        {view === "table" ? (
            <MembersTable
              data={data}
              page={page}
              perPage={perPage}
              onPageChange={setPage}
              isPending={isPending}
              visibleColumns={visibleColumns}
              onToggleColumn={(col) =>
              setVisibleColumns((prev) => ({
                  ...prev,
                  [col]: !prev[col],
                }))
              }
            />
        ) : (
            <MembersCard
            data={data}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            isPending={isPending}
            />
        )}
        </div>
    </>
  );
};

