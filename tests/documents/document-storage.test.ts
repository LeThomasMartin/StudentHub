import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { removeStoredDocument, writeDocumentFile } from "../../apps/web/features/documents/document-storage";

let testRoot: string | undefined;
const previousStorageRoot = process.env.STUDENTHUB_STORAGE_ROOT;

afterEach(async () => {
  if (testRoot) await rm(testRoot, { recursive: true, force: true });
  testRoot = undefined;
  if (previousStorageRoot === undefined) delete process.env.STUDENTHUB_STORAGE_ROOT;
  else process.env.STUDENTHUB_STORAGE_ROOT = previousStorageRoot;
});

describe("document file storage", () => {
  it("writes atomically under the UUID directory and computes SHA-256", async () => {
    testRoot = await mkdtemp(join(tmpdir(), "studenthub-documents-"));
    process.env.STUDENTHUB_STORAGE_ROOT = testRoot;
    const bytes = Buffer.from("sample PDF payload");
    const id = randomUUID();
    const result = await writeDocumentFile(id, ".pdf", new File([bytes], "sample.pdf"));

    expect(result.storagePath).toBe(`documents/${id}/original.pdf`);
    expect(result.size).toBe(bytes.length);
    expect(result.checksum).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(await readFile(result.absolutePath)).toEqual(bytes);
    expect((await stat(result.directoryPath)).isDirectory()).toBe(true);

    await removeStoredDocument(id, ".pdf");
    await expect(stat(result.directoryPath)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
