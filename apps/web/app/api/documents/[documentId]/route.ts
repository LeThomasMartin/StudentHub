import { NextResponse } from "next/server";
import { z } from "zod";
import { documentRepository } from "@/features/documents/document-repository";
import { isSupportedDocumentExtension } from "@/features/documents/document-policy";
import {
  DocumentStorageError,
  moveDocumentToTrash,
  purgeTrashedDocument,
  restoreTrashedDocument,
} from "@/features/documents/document-storage";

export const runtime = "nodejs";

const documentIdSchema = z.string().uuid();
type RouteContext = { params: Promise<{ documentId: string }> };

function serializeDocument(document: NonNullable<Awaited<ReturnType<typeof documentRepository.find>>>) {
  return { ...document, size: Number(document.size) };
}

export async function GET(_request: Request, context: RouteContext) {
  const { documentId } = await context.params;
  if (!documentIdSchema.safeParse(documentId).success) {
    return NextResponse.json({ error: "Identifiant de document invalide." }, { status: 400 });
  }

  try {
    const document = await documentRepository.find(documentId);
    if (!document) {
      return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
    }
    return NextResponse.json({ document: serializeDocument(document) });
  } catch {
    return NextResponse.json({ error: "Impossible de charger le document." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { documentId } = await context.params;
  if (!documentIdSchema.safeParse(documentId).success) {
    return NextResponse.json({ error: "Identifiant de document invalide." }, { status: 400 });
  }

  let document;
  try {
    document = await documentRepository.find(documentId);
  } catch {
    return NextResponse.json({ error: "Impossible de charger le document." }, { status: 500 });
  }
  if (!document) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
  if (!isSupportedDocumentExtension(document.extension)) {
    return NextResponse.json({ error: "Le format enregistré pour ce document est invalide." }, { status: 500 });
  }

  let trash;
  try {
    trash = await moveDocumentToTrash(document.id, document.extension);
  } catch (error) {
    if (error instanceof DocumentStorageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Impossible de préparer la suppression du fichier." }, { status: 500 });
  }

  let deleted: boolean;
  try {
    deleted = await documentRepository.delete(documentId);
  } catch {
    try {
      await restoreTrashedDocument(trash.trashPath, trash.directoryPath);
    } catch {
      console.error("Document restore failed after database delete error", { documentId });
    }
    return NextResponse.json({ error: "Impossible de supprimer le document de la base." }, { status: 500 });
  }

  if (!deleted) {
    try {
      await restoreTrashedDocument(trash.trashPath, trash.directoryPath);
    } catch {
      console.error("Document restore failed after concurrent delete", { documentId });
    }
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  try {
    await purgeTrashedDocument(trash.trashPath);
    return NextResponse.json({ deleted: true });
  } catch {
    console.error("Document trash cleanup pending", { documentId });
    return NextResponse.json({ deleted: true, cleanupPending: true });
  }
}
