import "server-only";
import { prisma } from "@/lib/prisma";
import type { SettingsFormValues } from "@/lib/settings-form";

/**
 * Admin Site Settings — the write side of the single-row config table.
 *
 * The public read lives in `site.service.getSiteSettings()` (and is cached per
 * render by `lib/site.ts`); this owns the edit. The row uses a fixed id, so
 * "create or update" is an upsert and there is never more than one.
 *
 * Only four columns exist to edit (see `lib/settings-form.ts` for why). The
 * important one is `whatsappNumber` — booking.service refuses to build an
 * enquiry without it, so this page is how the founder replaces the seeded
 * `910000000000` placeholder with the real number.
 */

/** The row uses a fixed id rather than an arbitrary cuid. */
const SETTINGS_ID = "default";

export type AdminSettings = {
  whatsappNumber: string;
  supportPhone: string | null;
  supportEmail: string | null;
  instagramUrl: string | null;
  updatedAt: Date | null;
  /** False before the row has ever been written — the form shows a first-run hint. */
  exists: boolean;
};

export class SettingsAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsAdminError";
  }
}

/** The settings as the admin form needs them. Never null — an unset row reads
 *  as empty defaults so the page renders and can be filled in. */
export async function getSettingsForAdmin(): Promise<AdminSettings> {
  const row = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!row) {
    return {
      whatsappNumber: "",
      supportPhone: null,
      supportEmail: null,
      instagramUrl: null,
      updatedAt: null,
      exists: false,
    };
  }

  return {
    whatsappNumber: row.whatsappNumber,
    supportPhone: row.supportPhone,
    supportEmail: row.supportEmail,
    instagramUrl: row.instagramUrl,
    updatedAt: row.updatedAt,
    exists: true,
  };
}

/** Create or update the one settings row. */
export async function updateSettings(
  input: SettingsFormValues,
): Promise<AdminSettings> {
  const data = {
    whatsappNumber: input.whatsappNumber.trim(),
    supportPhone: emptyToNull(input.supportPhone),
    supportEmail: emptyToNull(input.supportEmail),
    instagramUrl: emptyToNull(input.instagramUrl),
  };

  const row = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });

  return {
    whatsappNumber: row.whatsappNumber,
    supportPhone: row.supportPhone,
    supportEmail: row.supportEmail,
    instagramUrl: row.instagramUrl,
    updatedAt: row.updatedAt,
    exists: true,
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}
