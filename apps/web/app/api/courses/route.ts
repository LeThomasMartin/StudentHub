import { NextResponse } from "next/server";
import { courseInputSchema } from "@/features/courses/course-schemas";
import { courseRepository } from "@/features/courses/course-repository";
import {
  createCourse,
  listCoursesBySemester,
  SemesterNotFoundError,
} from "@/features/courses/course-service";

export async function GET() {
  try {
    const semesters = await listCoursesBySemester(courseRepository);
    return NextResponse.json({ semesters });
  } catch (error) {
    console.error("Failed to load courses", error);
    return NextResponse.json(
      { error: "Impossible de charger les cours. Réessaie dans un instant." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = courseInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Les informations du cours sont invalides." },
      { status: 400 },
    );
  }

  try {
    const course = await createCourse(parsed.data, courseRepository);
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof SemesterNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create course", error);
    return NextResponse.json(
      { error: "Impossible d’ajouter le cours pour le moment." },
      { status: 500 },
    );
  }
}
