import { NextResponse } from "next/server";
import { courseIdSchema, courseInputSchema } from "@/features/courses/course-schemas";
import { courseRepository } from "@/features/courses/course-repository";
import {
  deleteCourse,
  SemesterNotFoundError,
  updateCourse,
} from "@/features/courses/course-service";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

async function readCourseId(context: RouteContext): Promise<string | null> {
  const { courseId } = await context.params;
  const parsed = courseIdSchema.safeParse(courseId);
  return parsed.success ? parsed.data : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const courseId = await readCourseId(context);
  if (!courseId) {
    return NextResponse.json({ error: "Identifiant de cours invalide." }, { status: 400 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = courseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Les informations du cours sont invalides." },
      { status: 400 },
    );
  }

  try {
    const course = await updateCourse(courseId, parsed.data, courseRepository);
    if (!course) {
      return NextResponse.json({ error: "Ce cours n’existe plus." }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (error) {
    if (error instanceof SemesterNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update course", error);
    return NextResponse.json(
      { error: "Impossible de modifier le cours pour le moment." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const courseId = await readCourseId(context);
  if (!courseId) {
    return NextResponse.json({ error: "Identifiant de cours invalide." }, { status: 400 });
  }

  try {
    const deleted = await deleteCourse(courseId, courseRepository);
    if (!deleted) {
      return NextResponse.json({ error: "Ce cours n’existe plus." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete course", error);
    return NextResponse.json(
      { error: "Impossible de supprimer ce cours pour le moment." },
      { status: 500 },
    );
  }
}
