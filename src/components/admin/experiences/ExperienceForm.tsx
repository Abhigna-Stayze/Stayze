"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import {
  experienceFormSchema,
  type ExperienceFormValues,
} from "@/lib/experience-form";
import {
  createExperience,
  updateExperience,
  type ApiError,
} from "@/lib/admin-client";
import type { StayOption } from "@/services/admin-experience.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/stays/ImageInputs";
import { AssignStaysField } from "@/components/admin/experiences/AssignStaysField";

type FormInput = z.input<typeof experienceFormSchema>;

const SELECT =
  "border-input bg-card text-ink focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <h2 className="heading-3 text-bark">{title}</h2>
      {description && (
        <p className="text-muted-ink mt-1 text-sm">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow text-muted-ink mb-1.5 block">{children}</span>
  );
}

/**
 * The experience create/edit editor — one component for both, driven by
 * `react-hook-form` + a Zod resolver over the shared `experienceFormSchema`. On
 * submit it posts (create) or patches (edit) via the admin REST client; a 422's
 * per-field issues map back onto the inputs. The cover uploads as it's picked
 * and rides along in the payload as a ref.
 *
 * Sections mirror the brief: Basic information, Media, SEO, Assign to stays,
 * Status. Category/duration/difficulty/gallery/details are intentionally absent
 * — they'd require new columns, and this build adds none.
 */
export function ExperienceForm({
  mode,
  experienceId,
  slug,
  defaultValues,
  stays,
}: {
  mode: "create" | "edit";
  experienceId?: string;
  slug?: string;
  defaultValues: ExperienceFormValues;
  stays: StayOption[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: defaultValues as FormInput,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  // Preview reflects the *saved* published state — the public page only exists
  // once the experience is live, and the page reloads with fresh defaults on save.
  const isPublished = defaultValues.isPublished;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (mode === "create") await createExperience(values);
      else await updateExperience(experienceId!, values);
      router.push("/admin/experiences");
      router.refresh();
    } catch (e) {
      const apiErr = e as ApiError;
      apiErr.issues?.forEach((i) => {
        if (i.field)
          setError(i.field as keyof FormInput, { message: i.message });
      });
      setServerError(apiErr.message);
    }
  });

  const err = (name: keyof FormInput) =>
    errors[name]?.message as string | undefined;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {serverError && (
        <div
          role="alert"
          className="border-error/30 bg-error/10 text-error flex items-center gap-2 rounded-md border px-4 py-3 text-sm"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {serverError}
        </div>
      )}

      {/* Basic information */}
      <Section
        title="Basic information"
        description="What the experience is, and how it reads on its page."
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="Coffee Estate Tour"
            error={err("title")}
            {...register("title")}
          />
          <Textarea
            label="Short description"
            hint="The card pull-quote."
            rows={2}
            error={err("excerpt")}
            {...register("excerpt")}
          />
          <Textarea
            label="Full description"
            rows={6}
            error={err("story")}
            {...register("story")}
          />
        </div>
      </Section>

      {/* Media */}
      <Section
        title="Media"
        description="The cover image shown on cards and the hero."
      >
        <div className="sm:max-w-md">
          <Label>Cover image</Label>
          <Controller
            control={control}
            name="coverImage"
            render={({ field }) => (
              <ImageField
                value={field.value ?? null}
                onChange={field.onChange}
                kind="experience"
                aspect="aspect-[16/10]"
              />
            )}
          />
        </div>
      </Section>

      {/* Assign to stays */}
      <Section
        title="Assign to stays"
        description="The stays that offer this experience. It appears in their “What you’ll experience” section once both are published."
      >
        <Controller
          control={control}
          name="stayIds"
          render={({ field }) => (
            <AssignStaysField
              options={stays}
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      {/* Status & SEO */}
      <Section
        title="Status & SEO"
        description="Publishing and search metadata."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="status"
              className="eyebrow text-muted-ink mb-1.5 block"
            >
              Status
            </label>
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <select
                  id="status"
                  className={SELECT}
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                >
                  <option value="false">Draft</option>
                  <option value="true">Published</option>
                </select>
              )}
            />
          </div>
          <div />
          <Input
            label="Slug (URL)"
            hint={
              mode === "edit"
                ? "Changing this changes the public URL."
                : "Auto-generated from the title."
            }
            mono
            error={err("slug")}
            disabled={mode === "create"}
            {...register("slug")}
          />
          <div />
          <Input
            label="Meta title"
            error={err("metaTitle")}
            {...register("metaTitle")}
          />
          <Input
            label="Meta description"
            error={err("metaDescription")}
            {...register("metaDescription")}
          />
        </div>
      </Section>

      {/* Submit bar */}
      <div className="border-border bg-card/95 sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        {mode === "edit" && slug && isPublished && (
          <a
            href={`/experiences/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border text-bark hover:bg-paper-2 mr-auto inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium"
          >
            <ExternalLink className="size-4" aria-hidden />
            Preview
          </a>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          {mode === "create" ? "Create experience" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
