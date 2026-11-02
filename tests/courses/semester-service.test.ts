import { describe, expect, it, vi } from "vitest";
import {
  createSemester,
  type SemesterRepository,
} from "../../apps/web/features/courses/semester-service";
import { semesterInputSchema } from "../../apps/web/features/courses/semester-schemas";

describe("semester service", () => {
  it("creates a semester through its repository", async () => {
    const input = semesterInputSchema.parse({
      name: "Automne 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
    });
    const createdSemester = {
      id: "semester-1",
      ...input,
    };
    const repository: SemesterRepository = {
      create: vi.fn(async () => createdSemester),
    };

    await expect(createSemester(input, repository)).resolves.toEqual(createdSemester);
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});
