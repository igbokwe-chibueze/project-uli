// src/types/organisations/member.types.ts

import { OrgRole } from "@prisma/client";

export type MemberStatus = "active" | "pending" | "invited";

export interface MemberListItem {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  phone?: string;
  department?: string;
  position?: string;
  joinedAt: string; // ISO string
  status: MemberStatus;
  avatarUrl?: string;
  employeeId?: string;
}
