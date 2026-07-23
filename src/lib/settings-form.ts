import { z } from "zod";

/**
 * The Site Settings contract — a **pure** Zod module (no `server-only`, no data
 * access), shared by the admin form and the REST route, like `stay-form.ts`.
 *
 * Scope note: `SiteSetting` in Schema v1.1 has exactly four editable columns —
 * `whatsappNumber`, `supportPhone`, `supportEmail`, `instagramUrl`. Brand, hero,
 * footer, SEO defaults, currency and the other social networks would each need a
 * new column, and this phase adds none, so they are deliberately not here.
 *
 * `whatsappNumber` is the load-bearing one: it is the number every booking
 * enquiry is sent to, and `booking.service` refuses to proceed without it.
 */

/** A phone number — lenient (many formats), digits-ish, 7–20 chars. */
const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(20)
  .regex(/^[+0-9()\s-]+$/, "Enter a valid phone number.");

const optionalPhone = phone.optional().or(z.literal(""));

export const settingsFormSchema = z.object({
  /** Required — without it there is no booking flow at all. */
  whatsappNumber: phone,
  supportPhone: optionalPhone,
  supportEmail: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .refine(
      (u) => /instagram\.com/i.test(u),
      "That doesn’t look like an Instagram link.",
    )
    .optional()
    .or(z.literal("")),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
export type SettingsFormInput = z.input<typeof settingsFormSchema>;

export const emptySettingsForm: SettingsFormValues = {
  whatsappNumber: "",
  supportPhone: "",
  supportEmail: "",
  instagramUrl: "",
};

/** The media meta edit (alt text / caption) — stay images only. */
export const mediaMetaSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
  altText: z.string().trim().max(200).optional().nullable(),
  caption: z.string().trim().max(200).optional().nullable(),
});

/** The media delete payload. `force` detaches every reference first. */
export const mediaDeleteSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1),
  force: z.boolean().optional(),
});
