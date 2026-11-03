import type { SemesterInput } from "./semester-schemas";
import type { SemesterSummary } from "./course-types";

export interface SemesterRepository {
  create(input: SemesterInput): Promise<SemesterSummary>;
  deleteIfEmpty(id: string): Promise<boolean>;
}

export async function createSemester(
  input: SemesterInput,
  repository: SemesterRepository,
): Promise<SemesterSummary> {
  return repository.create(input);
}

export async function deleteEmptySemester(
  id: string,
  repository: SemesterRepository,
): Promise<boolean> {
  return repository.deleteIfEmpty(id);
}
