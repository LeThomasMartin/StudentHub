export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;

const supportedTypes = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".one": "application/onenote",
} as const;

export type DocumentExtension = keyof typeof supportedTypes;

export class DocumentValidationError extends Error {}

export function isSupportedDocumentExtension(value: string): value is DocumentExtension {
  return Object.prototype.hasOwnProperty.call(supportedTypes, value);
}

export function getDocumentType(filename: string): {
  originalFilename: string;
  extension: DocumentExtension;
  mimeType: string;
} {
  const originalFilename = filename.split(/[\\/]/).pop()?.trim() ?? "";
  if (!originalFilename || originalFilename.length > 255 || /[\u0000-\u001f\u007f]/.test(originalFilename)) {
    throw new DocumentValidationError("Le nom du fichier est invalide.");
  }

  const extension = originalFilename.slice(originalFilename.lastIndexOf(".")).toLowerCase();
  if (!isSupportedDocumentExtension(extension)) {
    throw new DocumentValidationError("Format non accepté. Utilise un fichier PDF, Word ou OneNote.");
  }

  return {
    originalFilename,
    extension,
    mimeType: supportedTypes[extension],
  };
}

export function validateDocumentSize(size: number): void {
  if (!Number.isSafeInteger(size) || size < 1) {
    throw new DocumentValidationError("Le fichier est vide ou sa taille est invalide.");
  }
  if (size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new DocumentValidationError("Le fichier dépasse la taille maximale de 25 Mo.");
  }
}

export function getDocumentName(value: FormDataEntryValue | null, originalFilename: string): string {
  const name = typeof value === "string" ? value.trim() : "";
  const fallbackName = originalFilename.replace(/\.[^.]+$/, "");
  const resolvedName = name || fallbackName;
  if (!resolvedName || resolvedName.length > 200 || /[\u0000-\u001f\u007f]/.test(resolvedName)) {
    throw new DocumentValidationError("Le nom du document doit contenir au maximum 200 caractères.");
  }
  return resolvedName;
}
