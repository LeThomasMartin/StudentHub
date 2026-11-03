import { prisma } from "@studenthub/database";

const documentSelect = {
  id: true,
  name: true,
  originalFilename: true,
  extension: true,
  mimeType: true,
  size: true,
  checksum: true,
  storagePath: true,
  courseId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type DocumentRecord = {
  id: string;
  name: string;
  originalFilename: string;
  extension: string;
  mimeType: string;
  size: bigint;
  checksum: string;
  storagePath: string;
  courseId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const documentRepository = {
  async list(courseId?: string): Promise<DocumentRecord[]> {
    return prisma.document.findMany({
      where: courseId ? { courseId } : undefined,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: documentSelect,
    });
  },

  async find(id: string): Promise<DocumentRecord | null> {
    return prisma.document.findUnique({ where: { id }, select: documentSelect });
  },

  async courseExists(id: string): Promise<boolean> {
    const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
    return course !== null;
  },

  async create(input: Omit<DocumentRecord, "createdAt" | "updatedAt">): Promise<DocumentRecord> {
    return prisma.document.create({ data: input, select: documentSelect });
  },

  async delete(id: string): Promise<boolean> {
    const result = await prisma.document.deleteMany({ where: { id } });
    return result.count > 0;
  },
};
