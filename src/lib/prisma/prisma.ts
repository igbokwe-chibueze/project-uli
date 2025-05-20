// src/lib/prisma/prisma.ts

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use a global variable to ensure a single instance in dev (Next.js hot reload)
declare const global: typeof globalThis & { prisma?: PrismaClient }

const prisma = global.prisma
  ?? new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma