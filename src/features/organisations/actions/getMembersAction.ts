// src/features/organisations/actions/getMembersAction.ts
"use server";

import { prisma } from "@/lib/prisma/prisma";
import { Prisma, OrgRole } from "@prisma/client";
import { MemberListItem, MemberStatus } from "@/types/organisations/member.types";

// --------------------
// Types
// --------------------
type MemberSortField = "name" | "email" | "role" | "joinedAt";
type SortOrder = "asc" | "desc";

interface GetMembersOptions {
  orgId: string;
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: MemberSortField;
  sortOrder?: SortOrder;
  departmentId?: string;
  role?: OrgRole;
  status?: MemberStatus;
}

// --------------------
// Server Action
// --------------------
export const getMembersAction = async ({
  orgId,
  page = 1,
  perPage = 10,
  search,
  sortBy = "joinedAt",
  sortOrder = "desc",
  departmentId,
  role,
  status,
}: GetMembersOptions) => {
  // --------------------
  // WHERE CLAUSE (fully typed)
  // --------------------
  const where: Prisma.OrganizationMemberWhereInput = { orgId };

  if (search) {
    where.OR = [
      { user: { firstName: { contains: search, mode: "insensitive" } } },
      { user: { lastName: { contains: search, mode: "insensitive" } } },
      { orgEmail: { contains: search, mode: "insensitive" } },
      { staffNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  if (departmentId) where.departmentId = departmentId;
  if (role) where.role = role;

  if (status === "active") {
    where.user = { isActive: true };
  }

  if (status === "pending") {
    where.user = { emailVerified: null };
  }

  if (status === "invited") {
    where.user = { emailVerified: null };
    where.orgEmail = { not: null };
  }

  // --------------------
  // SORT MAPPING (SAFE)
  // --------------------
  const orderBy: Prisma.OrganizationMemberOrderByWithRelationInput =
    sortBy === "name"
      ? { user: { firstName: sortOrder } }
      : sortBy === "email"
        ? { orgEmail: sortOrder }
        : { [sortBy]: sortOrder };

  // --------------------
  // QUERY
  // --------------------
  const [total, members] = await prisma.$transaction([
    prisma.organizationMember.count({ where }),
    prisma.organizationMember.findMany({
      where,
      include: {
        user: true,
        department: true,
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  // --------------------
  // MAP → DTO (CLIENT SAFE)
  // --------------------
  const mappedMembers: MemberListItem[] = members.map((m) => {
    const status: MemberStatus =
      m.user.emailVerified
        ? m.user.isActive
          ? "active"
          : "pending"
        : m.orgEmail
          ? "invited"
          : "pending";

    return {
      id: m.id,
      name: `${m.user.firstName} ${m.user.lastName}`,
      email: m.orgEmail ?? m.user.email,
      role: m.role,
      phone: m.internalPhoneNumber ?? m.user.phoneNumber ?? undefined,
      department: m.department?.name,
      position: m.orgBio ?? undefined,
      joinedAt: m.joinedAt.toISOString(),
      status,
      avatarUrl: m.orgProfilePicture ?? m.user.image ?? undefined,
      employeeId: m.staffNumber ?? undefined,
    };
  });

  return {
    members: mappedMembers,
    total,
    page,
    perPage,
  };
};
