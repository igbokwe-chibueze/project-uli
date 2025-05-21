// src/lib/prisma/prisma.ts

import { PrismaClient } from "@prisma/client"

 
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
 
export const prisma = globalForPrisma.prisma || new PrismaClient()
 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// import { PrismaClient } from '@prisma/client'
// import { withAccelerate } from '@prisma/extension-accelerate'

// // Use a global variable to ensure a single instance in dev (Next.js hot reload)
// declare const global: typeof globalThis & { prisma?: PrismaClient }

// const prisma = global.prisma
//   ?? new PrismaClient().$extends(withAccelerate())

// if (process.env.NODE_ENV !== 'production') {
//   global.prisma = prisma
// }

// export default prisma