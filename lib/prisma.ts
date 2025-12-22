import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // ▼ 追加：開発中にターミナルで実行されたSQLを確認できるようにします
    // エラー調査や、ちゃんと保存されたか確認するのに便利です
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma