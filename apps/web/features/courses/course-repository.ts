import { prisma } from "@studenthub/database";
import type { CourseInput } from "./course-schemas";
import type { CourseRepository } from "./course-service";
import type { CourseSummary, SemesterCourseGroup } from "./course-types";

const courseSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
} as const;

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const courseRepository: CourseRepository = {
  async listBySemester(): Promise<SemesterCourseGroup[]> {
    const semesters = await prisma.semester.findMany({
      orderBy: [{ startDate: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        courses: {
          orderBy: { name: "asc" },
          select: courseSelect,
        },
      },
    });

    return semesters.map((semester) => ({
      ...semester,
      startDate: toDateOnly(semester.startDate),
      endDate: toDateOnly(semester.endDate),
    }));
  },

  async semesterExists(id: string): Promise<boolean> {
    const semester = await prisma.semester.findUnique({
      where: { id },
      select: { id: true },
    });
    return semester !== null;
  },

  async courseExists(id: string): Promise<boolean> {
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });
    return course !== null;
  },

  async create(input: CourseInput): Promise<CourseSummary> {
    return prisma.course.create({
      data: {
        name: input.name,
        code: input.code ?? null,
        description: input.description ?? null,
        semesterId: input.semesterId,
      },
      select: courseSelect,
    });
  },

  async update(id: string, input: CourseInput): Promise<CourseSummary> {
    return prisma.course.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code ?? null,
        description: input.description ?? null,
        semesterId: input.semesterId,
      },
      select: courseSelect,
    });
  },

  async delete(id: string): Promise<boolean> {
    const result = await prisma.course.deleteMany({ where: { id } });
    return result.count > 0;
  },
};
