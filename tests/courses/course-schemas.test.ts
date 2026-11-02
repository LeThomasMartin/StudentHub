import { describe, expect, it } from "vitest";
import { courseIdSchema, courseInputSchema } from "../../apps/web/features/courses/course-schemas";

const validCourse = {
  name: "  Anatomie fonctionnelle  ",
  code: " PHT-1001 ",
  description: "  Introduction au mouvement  ",
  semesterId: "3f2d2a31-5bb3-4a6c-9480-92e75c50776a",
};

describe("courseInputSchema", () => {
  it("trims required and optional text fields", () => {
    expect(courseInputSchema.parse(validCourse)).toEqual({
      name: "Anatomie fonctionnelle",
      code: "PHT-1001",
      description: "Introduction au mouvement",
      semesterId: validCourse.semesterId,
    });
  });

  it("converts blank optional values to null", () => {
    expect(
      courseInputSchema.parse({
        ...validCourse,
        code: " ",
        description: "",
      }),
    ).toMatchObject({ code: null, description: null });
  });

  it("rejects a blank name", () => {
    expect(courseInputSchema.safeParse({ ...validCourse, name: "  " }).success).toBe(false);
  });

  it("rejects a missing or malformed semester id", () => {
    expect(courseInputSchema.safeParse({ ...validCourse, semesterId: "" }).success).toBe(false);
    expect(
      courseInputSchema.safeParse({ ...validCourse, semesterId: undefined }).success,
    ).toBe(false);
  });

  it("rejects text exceeding its documented limit", () => {
    expect(
      courseInputSchema.safeParse({ ...validCourse, name: "c".repeat(101) }).success,
    ).toBe(false);
  });
});

describe("courseIdSchema", () => {
  it("accepts a UUID and rejects arbitrary route values", () => {
    expect(courseIdSchema.safeParse(validCourse.semesterId).success).toBe(true);
    expect(courseIdSchema.safeParse("not-a-uuid").success).toBe(false);
  });
});
