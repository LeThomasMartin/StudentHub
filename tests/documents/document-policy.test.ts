import { describe, expect, it } from "vitest";
import {
  DocumentValidationError,
  getDocumentName,
  getDocumentType,
  validateDocumentSize,
  MAX_DOCUMENT_SIZE_BYTES,
} from "../../apps/web/features/documents/document-policy";

describe("document upload policy", () => {
  it.each([
    ["notes.PDF", ".pdf", "application/pdf"],
    ["report.docx", ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ["legacy.doc", ".doc", "application/msword"],
    ["notebook.one", ".one", "application/onenote"],
  ])("accepts %s", (filename, extension, mimeType) => {
    expect(getDocumentType(filename)).toMatchObject({ extension, mimeType });
  });

  it("rejects unsupported extensions and control characters", () => {
    expect(() => getDocumentType("script.exe")).toThrow(DocumentValidationError);
    expect(() => getDocumentType("bad\nname.pdf")).toThrow(DocumentValidationError);
  });

  it("uses only the basename and derives a default display name", () => {
    const type = getDocumentType("C:\\fakepath\\mes notes.pdf");
    expect(type.originalFilename).toBe("mes notes.pdf");
    expect(getDocumentName(null, type.originalFilename)).toBe("mes notes");
  });

  it("enforces a non-empty maximum-sized upload", () => {
    expect(() => validateDocumentSize(0)).toThrow(DocumentValidationError);
    expect(() => validateDocumentSize(MAX_DOCUMENT_SIZE_BYTES + 1)).toThrow(DocumentValidationError);
    expect(() => validateDocumentSize(MAX_DOCUMENT_SIZE_BYTES)).not.toThrow();
  });
});
