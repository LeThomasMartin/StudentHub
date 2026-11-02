import type { SemesterInput } from "./semester-schemas";
import type { SemesterSummary } from "./course-types";

export interface SemesterRepository {
  create(input: SemesterInput): Promise<SemesterSummary>;
}

export async function createSemester(
  input: SemesterInput,
  repository: SemesterRepository,
): Promise<SemesterSummary> {
  return repository.create(input);
}
