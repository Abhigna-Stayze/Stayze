import { z } from "zod";
import { mediaRefSchema } from "@/lib/stay-form";

/**
 * The Experience create/edit contract — a **pure** Zod module (no `server-only`,
 * no data access), shared by the admin form (`react-hook-form` + `zodResolver`)
 * and the REST route, exactly like `stay-form.ts`. The service stays the
 * authority; this catches obvious mistakes before a round trip and keeps the two
 * validations from drifting.
 *
 * Every field here maps to a column that already exists on the `Experience`
 * model — no schema change. "Status" is the model's `isPublished` boolean
 * (Draft / Published); there is no Hidden state and no structured
 * category/duration/difficulty, because those would need new columns.
 */

/** Optional free-text field: allow empty string from the form, treat as absent. */
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const experienceFormSchema = z.object({
  // --- Basic information ---
  title: z.string().trim().min(2, "A title is required.").max(120),
  /** Auto-generated from the title on create; editable on edit. */
  slug: optionalText(80),
  /** Short description — the card pull-quote (`excerpt`). */
  excerpt: optionalText(300),
  /** Full description — the long narrative on the experience page (`story`). */
  story: z.string().trim().min(10, "Add a description — a sentence or two."),

  // --- Media ---
  coverImage: mediaRefSchema.nullish(),

  // --- SEO ---
  metaTitle: optionalText(160),
  metaDescription: optionalText(300),

  // --- Assign to stays (the StayExperience junction) ---
  stayIds: z.array(z.string()).default([]),

  // --- Status ---
  isPublished: z.boolean().default(false),
});

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

/** The form's *input* shape (before Zod coerces/transforms). Used by RHF. */
export type ExperienceFormInput = z.input<typeof experienceFormSchema>;

/** The empty form — a fresh draft. */
export const emptyExperienceForm: ExperienceFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  story: "",
  coverImage: null,
  metaTitle: "",
  metaDescription: "",
  stayIds: [],
  isPublished: false,
};

/** The status-only payload for the list's Publish / Unpublish action. */
export const experienceStatusSchema = z.object({
  isPublished: z.boolean(),
});
