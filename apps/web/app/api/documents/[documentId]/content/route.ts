import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { z } from "zod";
import { documentRepository } from "@/features/documents/document-repository";
import { isSupportedDocumentExtension } from "@/features/documents/document-policy";
import { DocumentStorageError, getStoredDocumentPath } from "@/features/documents/document-storage";

export const runtime = "nodejs";

const documentIdSchema = z.string().uuid();

export async function GET(_request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
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

  let filePath: string;
  try {
    filePath = await getStoredDocumentPath(document.id, document.extension);
  } catch (error) {
    if (error instanceof DocumentStorageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Le fichier associé au document est introuvable." }, { status: 404 });
  }

  const filename = encodeURIComponent(document.originalFilename).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  const fileStream = createReadStream(filePath);
  return new Response(Readable.toWeb(fileStream) as ReadableStream, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Length": String(Number(document.size)),
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
