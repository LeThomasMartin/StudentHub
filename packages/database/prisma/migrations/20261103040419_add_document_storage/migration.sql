-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" BIGINT NOT NULL,
    "checksum" CHAR(64) NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "course_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_course_id_idx" ON "documents"("course_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
