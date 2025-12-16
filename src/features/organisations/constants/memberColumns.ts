// src/features/organisations/constants/memberColumns.ts

export const MEMBER_COLUMNS = [
  "name",
  "email",
  "role",
  "department",
  "status",
  "joinedAt",
] as const;

export type MemberColumn = (typeof MEMBER_COLUMNS)[number];
