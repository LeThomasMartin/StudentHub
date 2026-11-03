import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DocumentValidationError, getDocumentName, getDocumentType, validateDocumentSize, MAX_DOCUMENT_SIZE_BYTES } from "@/features/documents/document-policy";
import { documentRepository } from "@/features/documents/document-repository";
import { DocumentStorageError, removeStoredDocument, writeDocumentFile } from "@/features/documents/document-storage";

export const runtime = "nodejs";

const courseIdSchema = z.string().uuid();
const MAX_MULTIPART_OVERHEAD_BYTES = 1024 * 1024;

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get("courseId") || undefined;
  if (courseId && !courseIdSchema.safeParse(courseId).success) {
    return NextResponse.json({ error: "Identifiant de cours invalide." }, { status: 400 });
  }

  try {
    const documents = await documentRepository.list(courseId);
    return NextResponse.json({ documents: documents.map((document) => ({ ...document, size: Number(document.size) })) });
  } catch {
    return NextResponse.json({ error: "Impossible de charger les documents." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const rawContentLength = request.headers.get("content-length");
  if (!rawContentLength || !/^\d+$/.test(rawContentLength)) {
    return NextResponse.json({ error: "La taille de l’envoi doit être connue à l’avance." }, { status: 411 });
  }
  const contentLength = Number(rawContentLength);
  if (Number.isFinite(contentLength) && contentLength > MAX_DOCUMENT_SIZE_BYTES + MAX_MULTIPART_OVERHEAD_BYTES) {
    return NextResponse.json({ error: "Le fichier dépasse la taille maximale de 25 Mo." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Le formulaire d’envoi est invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Sélectionne un fichier à envoyer." }, { status: 400 });
  }

  let fileType;
  let name: string;
  try {
    fileType = getDocumentType(file.name);
    validateDocumentSize(file.size);
    name = getDocumentName(formData.get("name"), fileType.originalFilename);
  } catch (error) {
    if (error instanceof DocumentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Les informations du fichier sont invalides." }, { status: 400 });
  }

  const rawCourseId = formData.get("courseId");
  let courseId: string | null = null;
  if (rawCourseId !== null && rawCourseId !== "") {
    if (typeof rawCourseId !== "string" || !courseIdSchema.safeParse(rawCourseId).success) {
      return NextResponse.json({ error: "Identifiant de cours invalide." }, { status: 400 });
    }
    courseId = rawCourseId;
  }

  const id = randomUUID();
  let storedFile: Awaited<ReturnType<typeof writeDocumentFile>>;
  try {
    if (courseId && !(await documentRepository.courseExists(courseId))) {
      return NextResponse.json({ error: "Le cours sélectionné n’existe pas." }, { status: 400 });
    }
    storedFile = await writeDocumentFile(id, fileType.extension, file);
  } catch (error) {
    if (error instanceof DocumentStorageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Document file write failed", { documentId: id, errorName: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Impossible d’enregistrer le fichier." }, { status: 500 });
  }

  try {
    const document = await documentRepository.create({
      id,
      name,
      originalFilename: fileType.originalFilename,
      extension: fileType.extension,
      mimeType: fileType.mimeType,
      size: BigInt(storedFile.size),
      checksum: storedFile.checksum,
      storagePath: storedFile.storagePath,
      courseId,
    });
    return NextResponse.json({ document: { ...document, size: Number(document.size) } }, { status: 201 });
  } catch (error) {
    try {
      await removeStoredDocument(id, fileType.extension);
    } catch {
      console.error("Orphaned document file cleanup failed", { documentId: id });
    }
    console.error("Document metadata insert failed", { documentId: id, errorName: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Impossible d’enregistrer les métadonnées du document." }, { status: 500 });
  }
}
