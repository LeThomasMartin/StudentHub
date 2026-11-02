import { NextResponse } from "next/server";
import { semesterInputSchema } from "@/features/courses/semester-schemas";
import { createSemester } from "@/features/courses/semester-service";
import { semesterRepository } from "@/features/courses/semester-repository";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = semesterInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Les informations de la session sont invalides.",
      },
      { status: 400 },
    );
  }

  try {
    const semester = await createSemester(parsed.data, semesterRepository);
    return NextResponse.json({ semester }, { status: 201 });
  } catch (error) {
    console.error("Failed to create semester", error);
    return NextResponse.json(
      { error: "Impossible de créer la session pour le moment." },
      { status: 500 },
    );
  }
}
