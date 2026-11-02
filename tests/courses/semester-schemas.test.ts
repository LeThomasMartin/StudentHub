import { describe, expect, it } from "vitest";
import { semesterInputSchema } from "../../apps/web/features/courses/semester-schemas";

const validSemester = {
  name: "  Automne 2026  ",
  startDate: "2026-09-01",
  endDate: "2026-12-20",
};

describe("semesterInputSchema", () => {
  it("trims and accepts a valid semester", () => {
    expect(semesterInputSchema.parse(validSemester)).toEqual({
      name: "Automne 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
    });
  });

  it("rejects blank names and impossible calendar dates", () => {
    expect(semesterInputSchema.safeParse({ ...validSemester, name: " " }).success).toBe(false);
    expect(
      semesterInputSchema.safeParse({ ...validSemester, startDate: "2026-02-30" }).success,
    ).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    expect(
      semesterInputSchema.safeParse({
        ...validSemester,
        startDate: "2026-12-20",
        endDate: "2026-09-01",
      }).success,
    ).toBe(false);
  });
});
