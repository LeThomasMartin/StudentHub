import { prisma } from "@studenthub/database";
import type { SemesterRepository } from "./semester-service";
import type { SemesterSummary } from "./course-types";

export const semesterRepository: SemesterRepository = {
  async create(input): Promise<SemesterSummary> {
    const semester = await prisma.semester.create({
      data: {
        name: input.name,
        startDate: new Date(`${input.startDate}T00:00:00.000Z`),
        endDate: new Date(`${input.endDate}T00:00:00.000Z`),
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    return {
      ...semester,
      startDate: semester.startDate.toISOString().slice(0, 10),
      endDate: semester.endDate.toISOString().slice(0, 10),
    };
  },
};
