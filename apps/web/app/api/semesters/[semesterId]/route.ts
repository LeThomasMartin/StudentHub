import { NextResponse } from "next/server";
import { semesterIdSchema } from "@/features/courses/semester-schemas";
import { deleteEmptySemester } from "@/features/courses/semester-service";
import { semesterRepository } from "@/features/courses/semester-repository";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ semesterId: string }> },
) {
  const { semesterId } = await params;
  const parsed = semesterIdSchema.safeParse(semesterId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Identifiant de session invalide." }, { status: 400 });
  }

  try {
    const deleted = await deleteEmptySemester(parsed.data, semesterRepository);
    if (!deleted) {
      return NextResponse.json(
        { error: "Session introuvable ou contenant encore des cours." },
        { status: 409 },
      );
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete empty semester", error);
    return NextResponse.json(
      { error: "Impossible de supprimer la session pour le moment." },
      { status: 500 },
    );
  }
}
