import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCourse,
  deleteCourse,
  listCoursesBySemester,
  SemesterNotFoundError,
  updateCourse,
  type CourseRepository,
} from "../../apps/web/features/courses/course-service";
import { courseInputSchema } from "../../apps/web/features/courses/course-schemas";

const input = courseInputSchema.parse({
  name: "Physiologie",
  code: "",
  description: "",
  semesterId: "3f2d2a31-5bb3-4a6c-9480-92e75c50776a",
});

function makeRepository(): CourseRepository {
  return {
    listBySemester: vi.fn(async () => []),
    semesterExists: vi.fn(async () => true),
    courseExists: vi.fn(async () => true),
    create: vi.fn(async () => ({
      id: "course-1",
      name: input.name,
      code: null,
      description: null,
    })),
    update: vi.fn(async () => ({
      id: "course-1",
      name: input.name,
      code: null,
      description: null,
    })),
    delete: vi.fn(async () => true),
  };
}

describe("course service", () => {
  let repository: CourseRepository;

  beforeEach(() => {
    repository = makeRepository();
  });

  it("delegates the grouped course listing to its repository", async () => {
    await expect(listCoursesBySemester(repository)).resolves.toEqual([]);
    expect(repository.listBySemester).toHaveBeenCalledOnce();
  });

  it("creates a course only when its semester exists", async () => {
    await expect(createCourse(input, repository)).resolves.toMatchObject({
      id: "course-1",
      name: "Physiologie",
    });
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it("rejects creation when the selected semester is missing", async () => {
    vi.mocked(repository.semesterExists).mockResolvedValue(false);

    await expect(createCourse(input, repository)).rejects.toBeInstanceOf(
      SemesterNotFoundError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("returns null when asked to update a course that is missing", async () => {
    vi.mocked(repository.courseExists).mockResolvedValue(false);

    await expect(updateCourse("missing-course", input, repository)).resolves.toBeNull();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("reports whether a course was deleted", async () => {
    await expect(deleteCourse("course-1", repository)).resolves.toBe(true);
    expect(repository.delete).toHaveBeenCalledWith("course-1");

    vi.mocked(repository.delete).mockResolvedValue(false);
    await expect(deleteCourse("missing-course", repository)).resolves.toBe(false);
  });
});
