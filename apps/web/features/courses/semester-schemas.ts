import { z } from "zod";

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Entre une date valide.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Entre une date valide.");

export const semesterInputSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom de la session est requis.").max(100),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
  })
  .refine((semester) => semester.startDate <= semester.endDate, {
    path: ["endDate"],
    message: "La date de fin doit être égale ou postérieure à la date de début.",
  });

export type SemesterInput = z.infer<typeof semesterInputSchema>;
