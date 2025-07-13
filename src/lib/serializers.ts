// src/lib/serializers.ts

import { Module } from "@prisma/client";

/**
 * Turn a Prisma.Module object (which may contain Decimal instances)
 * into a plain‑JS object where `price` is a number or null.
 * More explanation this is to convert price (Decimal | null) into a number or string, as nextjs prefers it.
 */
export function serializeModule(
  m: Module
): Omit<Module, "price"> & { price: number | null } {
  return {
    ...m,
    // Convert Decimal to a JS number; leave nulls intact
    price: m.price !== null ? m.price.toNumber() : null,
  };
}
