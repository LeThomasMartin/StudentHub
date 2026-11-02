import type { CourseInput } from "./course-schemas";
import type { CourseSummary, SemesterCourseGroup } from "./course-types";

export interface CourseRepository {
  listBySemester(): Promise<SemesterCourseGroup[]>;
  semesterExists(id: string): Promise<boolean>;
  courseExists(id: string): Promise<boolean>;
  create(input: CourseInput): Promise<CourseSummary>;
  update(id: string, input: CourseInput): Promise<CourseSummary>;
  delete(id: string): Promise<boolean>;
}

export class SemesterNotFoundError extends Error {
  constructor() {
    super("La session sélectionnée n’existe pas.");
    this.name = "SemesterNotFoundError";
  }
}

export async function listCoursesBySemester(
  repository: CourseRepository,
): Promise<SemesterCourseGroup[]> {
  return repository.listBySemester();
}

export async function createCourse(
  input: CourseInput,
  repository: CourseRepository,
): Promise<CourseSummary> {
  if (!(await repository.semesterExists(input.semesterId))) {
    throw new SemesterNotFoundError();
  }
  return repository.create(input);
}

export async function updateCourse(
  id: string,
  input: CourseInput,
  repository: CourseRepository,
): Promise<CourseSummary | null> {
  if (!(await repository.courseExists(id))) {
    return null;
  }
  if (!(await repository.semesterExists(input.semesterId))) {
    throw new SemesterNotFoundError();
  }
  return repository.update(id, input);
}

export async function deleteCourse(
  id: string,
  repository: CourseRepository,
): Promise<boolean> {
  return repository.delete(id);
}
