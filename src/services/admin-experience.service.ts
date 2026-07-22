import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getPublicUrlOrNull, deleteFile, type MediaRef } from "@/lib/storage";
import type { ExperienceFormValues } from "@/lib/experience-form";

/**
 * Admin Experience management — the write side of experiences, plus the reads
 * the CMS needs (drafts included), kept separate from the public
 * `experience.service` (published-only). Both talk to Prisma; neither knows
 * about React or routes. The admin API layer guards these with a SUPER_ADMIN
 * session before ever calling in.
 *
 * An Experience is a first-class, shared entity: the SAME experience can be
 * offered at several stays. Stays are *assigned* to an experience here (the
 * `StayExperience` junction); the stay editor no longer creates experiences, it
 * only ticks which managed experiences it offers.
 *
 * Media follows the project rule: Postgres stores `{ bucket, path }`, the URL is
 * derived at read time, and the cover object is cleaned up when its row goes.
 */

export type AdminExperienceListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  assignedStays: number;
  isPublished: boolean;
  createdAt: Date;
};

export type AdminExperienceList = {
  items: AdminExperienceListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type AdminExperienceDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  story: string;
  coverImageUrl: string | null;
  coverImageRef: MediaRef | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  stayIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

/** A stay, for the editor's "assign to stays" multi-select. */
export type StayOption = {
  id: string;
  name: string;
  status: string;
};

/** An experience, for the stay editor's tick-list. */
export type ExperienceLinkOption = {
  id: string;
  title: string;
  isPublished: boolean;
};

export type ListParams = {
  search?: string;
  /** "published" | "draft" — the model has no third state. */
  status?: "published" | "draft";
  sort?: "newest" | "oldest" | "name";
  page?: number;
  pageSize?: number;
};

export class ExperienceAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExperienceAdminError";
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The admin table — server-side search, filter, sort and pagination. */
export async function listExperiences(
  params: ListParams,
): Promise<AdminExperienceList> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));
  const search = params.search?.trim();

  const where: Prisma.ExperienceWhereInput = {
    ...(params.status ? { isPublished: params.status === "published" } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ExperienceOrderByWithRelationInput =
    params.sort === "oldest"
      ? { createdAt: "asc" }
      : params.sort === "name"
        ? { title: "asc" }
        : { createdAt: "desc" };

  const [total, rows] = await Promise.all([
    prisma.experience.count({ where }),
    prisma.experience.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        bucket: true,
        path: true,
        isPublished: true,
        createdAt: true,
        _count: { select: { stays: true } },
      },
    }),
  ]);

  return {
    items: rows.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      excerpt: e.excerpt,
      coverImageUrl: getPublicUrlOrNull({ bucket: e.bucket, path: e.path }),
      assignedStays: e._count.stays,
      isPublished: e.isPublished,
      createdAt: e.createdAt,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** One experience, everything the edit page needs. Null if missing. */
export async function getExperienceForAdmin(
  id: string,
): Promise<AdminExperienceDetail | null> {
  const exp = await prisma.experience.findUnique({
    where: { id },
    include: {
      stays: {
        orderBy: { sortOrder: "asc" },
        select: { stayId: true },
      },
    },
  });
  if (!exp) return null;

  const coverImageRef =
    exp.bucket && exp.path ? { bucket: exp.bucket, path: exp.path } : null;

  return {
    id: exp.id,
    title: exp.title,
    slug: exp.slug,
    excerpt: exp.excerpt,
    story: exp.story,
    coverImageUrl: getPublicUrlOrNull({ bucket: exp.bucket, path: exp.path }),
    coverImageRef,
    metaTitle: exp.metaTitle,
    metaDescription: exp.metaDescription,
    isPublished: exp.isPublished,
    stayIds: exp.stays.map((s) => s.stayId),
    createdAt: exp.createdAt,
    updatedAt: exp.updatedAt,
  };
}

/** Every stay (bar deleted), for the editor's assign-to-stays multi-select. */
export async function getStayOptions(): Promise<StayOption[]> {
  const stays = await prisma.stay.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, status: true },
    orderBy: { name: "asc" },
  });
  return stays;
}

/**
 * Every experience, for the stay editor's tick-list. Draft experiences are
 * included (so a stay can be pre-assigned before an experience goes live) with
 * their publish state, so the UI can mark them.
 */
export async function getExperienceOptions(): Promise<ExperienceLinkOption[]> {
  return prisma.experience.findMany({
    select: { id: true, title: true, isPublished: true },
    orderBy: { title: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/** Create an experience and link the stays it's offered at. */
export async function createExperience(
  input: ExperienceFormValues,
): Promise<{ id: string; slug: string }> {
  const slug = input.slug?.trim()
    ? await uniqueSlug(input.slug)
    : await uniqueSlug(input.title);

  const created = await prisma.$transaction(async (tx) => {
    const exp = await tx.experience.create({
      data: {
        ...scalarData(input),
        slug,
      },
      select: { id: true, slug: true },
    });
    await syncStayLinks(tx, exp.id, input.stayIds);
    return exp;
  });

  return created;
}

/** Update every editable field and reconcile the stay assignments. */
export async function updateExperience(
  id: string,
  input: ExperienceFormValues,
): Promise<{ id: string; slug: string }> {
  const existing = await prisma.experience.findUnique({
    where: { id },
    select: { id: true, slug: true, bucket: true, path: true },
  });
  if (!existing)
    throw new ExperienceAdminError("That experience no longer exists.");

  const slug = input.slug?.trim()
    ? await uniqueSlug(input.slug, id)
    : existing.slug;

  // The old cover orphans if a different one (or none) is saved.
  const staleCover = refIfReplaced(
    { bucket: existing.bucket, path: existing.path },
    input.coverImage
      ? { bucket: input.coverImage.bucket, path: input.coverImage.path }
      : null,
  );

  await prisma.$transaction(async (tx) => {
    await tx.experience.update({
      where: { id },
      data: { ...scalarData(input), slug },
    });
    await syncStayLinks(tx, id, input.stayIds);
  });

  if (staleCover) await deleteQuietly(staleCover);

  return { id, slug };
}

/** Publish / unpublish. */
export async function setExperiencePublished(
  id: string,
  isPublished: boolean,
): Promise<void> {
  const exp = await prisma.experience.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exp) throw new ExperienceAdminError("That experience no longer exists.");
  await prisma.experience.update({ where: { id }, data: { isPublished } });
}

/**
 * Delete an experience. Hard delete — the model has no soft-delete column, and
 * adding one would change the schema. `StayExperience` links cascade away, so
 * every stay that offered it stops offering it. The cover object is binned.
 */
export async function deleteExperience(id: string): Promise<void> {
  const exp = await prisma.experience.findUnique({
    where: { id },
    select: { bucket: true, path: true },
  });
  if (!exp) throw new ExperienceAdminError("That experience no longer exists.");

  await prisma.experience.delete({ where: { id } });

  if (exp.bucket && exp.path) {
    await deleteQuietly({ bucket: exp.bucket, path: exp.path });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Tx = Prisma.TransactionClient;

/** The scalar Experience columns shared by create and update. */
function scalarData(input: ExperienceFormValues) {
  return {
    title: input.title.trim(),
    excerpt: emptyToNull(input.excerpt),
    story: input.story.trim(),
    bucket: input.coverImage?.bucket ?? "experiences",
    path: input.coverImage?.path ?? null,
    metaTitle: emptyToNull(input.metaTitle),
    metaDescription: emptyToNull(input.metaDescription),
    isPublished: input.isPublished,
  };
}

/**
 * Reconcile which stays offer this experience. Adds new links (appended after a
 * stay's existing experiences), removes dropped ones, and leaves untouched links
 * — and their per-stay `sortOrder` — alone. Never touches the Experience itself.
 */
async function syncStayLinks(
  tx: Tx,
  experienceId: string,
  stayIds: string[],
): Promise<void> {
  const wanted = [...new Set(stayIds)];
  const existing = await tx.stayExperience.findMany({
    where: { experienceId },
    select: { stayId: true },
  });
  const have = new Set(existing.map((e) => e.stayId));
  const wantedSet = new Set(wanted);

  const toRemove = existing
    .map((e) => e.stayId)
    .filter((s) => !wantedSet.has(s));
  if (toRemove.length > 0) {
    await tx.stayExperience.deleteMany({
      where: { experienceId, stayId: { in: toRemove } },
    });
  }

  const toAdd = wanted.filter((s) => !have.has(s));
  for (const stayId of toAdd) {
    // Append to the end of that stay's own experience ordering.
    const last = await tx.stayExperience.aggregate({
      where: { stayId },
      _max: { sortOrder: true },
    });
    await tx.stayExperience.create({
      data: {
        stayId,
        experienceId,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
      },
    });
  }
}

function emptyToNull(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/** The previous object, only if it's really being replaced by a different one. */
function refIfReplaced(
  previous: { bucket: string | null; path: string | null },
  next: MediaRef | null,
): MediaRef | null {
  if (!previous.bucket || !previous.path) return null;
  if (next && next.bucket === previous.bucket && next.path === previous.path) {
    return null;
  }
  return { bucket: previous.bucket, path: previous.path };
}

async function deleteQuietly(ref: MediaRef): Promise<void> {
  try {
    await deleteFile(ref);
  } catch (error) {
    console.error(
      `[admin-experience] orphaned ${ref.bucket}/${ref.path}:`,
      error,
    );
  }
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "experience"
  );
}

/** A URL-safe, unique experience slug. `excludeId` lets one keep its own slug. */
async function uniqueSlug(value: string, excludeId?: string): Promise<string> {
  const base = slugify(value);
  let slug = base;
  let n = 2;
  for (;;) {
    const clash = await prisma.experience.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash || clash.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}
