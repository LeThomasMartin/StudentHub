import { createWriteStream } from "node:fs";
import { mkdir, realpath, rename, rm, stat } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { DocumentExtension } from "./document-policy";
import { MAX_DOCUMENT_SIZE_BYTES } from "./document-policy";

export class DocumentStorageError extends Error {}

export interface StoredDocument {
  size: number;
  checksum: string;
  storagePath: string;
  absolutePath: string;
  directoryPath: string;
}

function isWithin(parent: string, child: string): boolean {
  const pathFromParent = relative(parent, child);
  return pathFromParent === "" || (pathFromParent !== ".." && !pathFromParent.startsWith(`..${sep}`) && !isAbsolute(pathFromParent));
}

export async function getStorageRoot(): Promise<string> {
  const configuredRoot = process.env.STUDENTHUB_STORAGE_ROOT?.trim();
  if (!configuredRoot) {
    throw new DocumentStorageError("Le stockage des documents n’est pas configuré.");
  }

  const resolvedRoot = resolve(configuredRoot);
  let rootInfo;
  try {
    rootInfo = await stat(resolvedRoot);
  } catch {
    throw new DocumentStorageError("Le dossier de stockage des documents est introuvable.");
  }
  if (!rootInfo.isDirectory()) {
    throw new DocumentStorageError("Le chemin de stockage configuré n’est pas un dossier.");
  }

  const canonicalRoot = await realpath(resolvedRoot);
  const workingDirectory = resolve(process.cwd());
  const repositoryRoot =
    workingDirectory.endsWith(`${sep}apps${sep}web`)
      ? resolve(workingDirectory, "..", "..")
      : workingDirectory;
  if (isWithin(repositoryRoot, canonicalRoot)) {
    throw new DocumentStorageError("Le stockage des documents doit être situé hors du dépôt.");
  }

  return canonicalRoot;
}

function documentPaths(root: string, id: string, extension: DocumentExtension) {
  const documentsRoot = resolve(root, "documents");
  const directoryPath = resolve(documentsRoot, id);
  const absolutePath = resolve(directoryPath, `original${extension}`);
  if (!isWithin(root, absolutePath) || !isWithin(documentsRoot, directoryPath)) {
    throw new DocumentStorageError("Chemin de document invalide.");
  }
  return { documentsRoot, directoryPath, absolutePath };
}

export async function writeDocumentFile(
  id: string,
  extension: DocumentExtension,
  file: File,
): Promise<StoredDocument> {
  const root = await getStorageRoot();
  const { documentsRoot, directoryPath, absolutePath } = documentPaths(root, id, extension);
  await mkdir(documentsRoot, { recursive: true });
  const canonicalDocumentsRoot = await realpath(documentsRoot);
  if (!isWithin(root, canonicalDocumentsRoot)) {
    throw new DocumentStorageError("Le dossier de documents sort du stockage configuré.");
  }
  await mkdir(directoryPath);
  const canonicalDirectory = await realpath(directoryPath);
  if (!isWithin(canonicalDocumentsRoot, canonicalDirectory)) {
    throw new DocumentStorageError("Le dossier du document sort du stockage configuré.");
  }

  const temporaryPath = join(directoryPath, `.upload-${randomUUID()}.tmp`);
  const hash = createHash("sha256");
  let size = 0;
  const sizeAndHash = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length;
      if (size > MAX_DOCUMENT_SIZE_BYTES) {
        callback(new DocumentStorageError("Le fichier dépasse la taille maximale de 25 Mo."));
        return;
      }
      hash.update(chunk);
      callback(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream),
      sizeAndHash,
      createWriteStream(temporaryPath, { flags: "wx" }),
    );
    if (size === 0) {
      throw new DocumentStorageError("Le fichier est vide.");
    }
    await rename(temporaryPath, absolutePath);
    return {
      size,
      checksum: hash.digest("hex"),
      storagePath: relative(root, absolutePath).split(sep).join("/"),
      absolutePath,
      directoryPath,
    };
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    await rm(directoryPath, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
}

export async function removeStoredDocument(id: string, extension: DocumentExtension): Promise<void> {
  const root = await getStorageRoot();
  const { directoryPath } = documentPaths(root, id, extension);
  await rm(directoryPath, { recursive: true, force: true });
}

export async function moveDocumentToTrash(
  id: string,
  extension: DocumentExtension,
): Promise<{ trashPath: string; directoryPath: string }> {
  const root = await getStorageRoot();
  const { documentsRoot, directoryPath } = documentPaths(root, id, extension);
  const trashPath = join(documentsRoot, `.deleting-${id}-${randomUUID()}`);
  await rename(directoryPath, trashPath);
  return { trashPath, directoryPath };
}

export async function restoreTrashedDocument(
  trashPath: string,
  directoryPath: string,
): Promise<void> {
  await rename(trashPath, directoryPath);
}

export async function purgeTrashedDocument(trashPath: string): Promise<void> {
  await rm(trashPath, { recursive: true, force: true });
}

export async function getStoredDocumentPath(id: string, extension: DocumentExtension): Promise<string> {
  const root = await getStorageRoot();
  const { documentsRoot, directoryPath, absolutePath } = documentPaths(root, id, extension);
  const canonicalDocumentsRoot = await realpath(documentsRoot);
  const canonicalDirectory = await realpath(directoryPath);
  if (!isWithin(root, canonicalDocumentsRoot) || !isWithin(canonicalDocumentsRoot, canonicalDirectory)) {
    throw new DocumentStorageError("Le chemin physique du document est invalide.");
  }

  const canonicalFile = await realpath(absolutePath);
  if (!isWithin(canonicalDirectory, canonicalFile)) {
    throw new DocumentStorageError("Le fichier sort du dossier du document.");
  }
  return canonicalFile;
}
