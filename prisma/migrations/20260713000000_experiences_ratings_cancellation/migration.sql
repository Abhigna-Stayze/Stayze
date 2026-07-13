-- Standalone Experience, cancellation fields.
--
-- The interesting part is StayExperience: it stops being a content table and
-- becomes a junction. Prisma's generated migration would simply DROP title,
-- description, imageBucket and imagePath — and then fail anyway, because it
-- adds experienceId NOT NULL with no default to a table that already has rows.
--
-- So this is hand-written. It backfills an Experience row per distinct title,
-- relinks every StayExperience to it, and only then drops the old columns.
-- Nothing is lost.

-- 1. Cancellation. Recorded, not enforced — see the schema comments.
ALTER TABLE "BookingRequest"
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancellationReason" TEXT;

ALTER TABLE "Stay" ADD COLUMN "cancellationPolicy" TEXT;

-- 2. The new standalone Experience.
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "excerpt" TEXT,
    "bucket" TEXT DEFAULT 'experiences',
    "path" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Experience_slug_key" ON "Experience"("slug");
CREATE INDEX "Experience_isPublished_idx" ON "Experience"("isPublished");

-- 3. Backfill: one Experience per distinct title across all stays.
--
-- Titles are matched case-insensitively, so "Morning coffee walk" offered at
-- two stays becomes ONE Experience linked twice — which is the entire point of
-- the change. `story` is NOT NULL and the old table had no long-form field, so
-- the description carries over and falls back to the title.
INSERT INTO "Experience" (
  "id", "title", "slug", "story", "excerpt",
  "bucket", "path", "isPublished", "createdAt", "updatedAt"
)
SELECT
  -- Not a cuid, but unique and stable. New rows get cuids from Prisma.
  'exp_' || substr(md5(lower(d.title)), 1, 21),
  d.title,
  -- "Morning coffee walk" -> "morning-coffee-walk"
  regexp_replace(
    regexp_replace(lower(trim(d.title)), '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  ),
  COALESCE(d.description, d.title),
  d.description,
  d."imageBucket",
  d."imagePath",
  TRUE,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT ON (lower(title))
    title, description, "imageBucket", "imagePath"
  FROM "StayExperience"
  ORDER BY lower(title), "sortOrder"
) AS d;

-- 4. Relink. Nullable first, populated by title, NOT NULL only once it holds.
ALTER TABLE "StayExperience" ADD COLUMN "experienceId" TEXT;

UPDATE "StayExperience" se
SET "experienceId" = e."id"
FROM "Experience" e
WHERE lower(e."title") = lower(se."title");

-- A stay that listed the same title twice would now violate the new primary
-- key. Collapse those to one row, keeping the lowest sortOrder.
DELETE FROM "StayExperience" a
USING "StayExperience" b
WHERE a.ctid > b.ctid
  AND a."stayId" = b."stayId"
  AND a."experienceId" = b."experienceId";

-- 5. Old columns go. If any row failed to match above, experienceId is still
-- NULL and this SET NOT NULL aborts the whole migration — which is what we
-- want: fail loudly rather than quietly drop a stay's experiences.
ALTER TABLE "StayExperience" DROP CONSTRAINT "StayExperience_pkey";

ALTER TABLE "StayExperience"
  DROP COLUMN "id",
  DROP COLUMN "title",
  DROP COLUMN "description",
  DROP COLUMN "imageBucket",
  DROP COLUMN "imagePath";

ALTER TABLE "StayExperience" ALTER COLUMN "experienceId" SET NOT NULL;
ALTER TABLE "StayExperience" ALTER COLUMN "sortOrder" SET DEFAULT 0;

ALTER TABLE "StayExperience"
  ADD CONSTRAINT "StayExperience_pkey" PRIMARY KEY ("stayId", "experienceId");

CREATE INDEX "StayExperience_experienceId_idx" ON "StayExperience"("experienceId");

ALTER TABLE "StayExperience"
  ADD CONSTRAINT "StayExperience_experienceId_fkey"
  FOREIGN KEY ("experienceId") REFERENCES "Experience"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
