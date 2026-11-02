import { z } from "zod";

const optionalCourseText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .optional();

export const courseInputSchema = z.object({
  name: z.string().trim().min(1, "Le nom du cours est requis.").max(100),
  code: optionalCourseText(30),
  description: optionalCourseText(2_000),
  semesterId: z.string().uuid("Sélectionne une session valide."),
});

export const courseIdSchema = z.string().uuid("Identifiant de cours invalide.");

export type CourseInput = z.infer<typeof courseInputSchema>;
