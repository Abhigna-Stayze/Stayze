"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import {
  stayFormSchema,
  STAY_STATUSES,
  VERIFICATIONS,
  type StayFormValues,
} from "@/lib/stay-form";
import { createStay, updateStay, type ApiError } from "@/lib/admin-client";
import type { AmenityOption } from "@/services/admin-stay.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField, GalleryField } from "@/components/admin/stays/ImageInputs";

/** The form's *input* shape (before Zod coerces/transforms to StayFormValues). */
type FormInput = z.input<typeof stayFormSchema>;

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

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="eyebrow text-muted-ink mb-1.5 block">
      {children}
    </label>
  );
}

/**
 * The stay create/edit form — one component for both, driven by
 * `react-hook-form` + a Zod resolver over the shared `stayFormSchema`. On
 * submit it posts (create) or patches (edit) via the admin REST client; a 422's
 * per-field issues are mapped back onto the inputs. Images upload as they're
 * picked and ride along in the payload as refs.
 */
export function StayForm({
  mode,
  stayId,
  defaultValues,
  amenities,
}: {
  mode: "create" | "edit";
  stayId?: string;
  defaultValues: StayFormValues;
  amenities: AmenityOption[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, StayFormValues>({
    resolver: zodResolver(stayFormSchema),
    defaultValues: defaultValues as FormInput,
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res =
        mode === "create"
          ? await createStay(values)
          : await updateStay(stayId!, values);
      router.push(`/admin/stays/${res.id}`);
      router.refresh();
    } catch (e) {
      const apiErr = e as ApiError;
      apiErr.issues?.forEach((i) => {
        // Only map issues onto real fields; unknown paths fall to the banner.
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

      {/* 1 · Owner */}
      <Section title="Owner" description="Who hosts this property.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Owner name"
            error={err("ownerName")}
            {...register("ownerName")}
          />
          <Input
            label="Owner mobile"
            error={err("ownerPhone")}
            {...register("ownerPhone")}
          />
          <div className="sm:col-span-2 sm:max-w-xs">
            <Label>Owner photo</Label>
            <Controller
              control={control}
              name="ownerPhotoRef"
              render={({ field }) => (
                <ImageField
                  value={field.value ?? null}
                  onChange={field.onChange}
                  kind="owner-photo"
                  aspect="aspect-square"
                />
              )}
            />
          </div>
        </div>
      </Section>

      {/* 2 · Property */}
      <Section title="Property" description="The essentials guests see first.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Property name"
            error={err("name")}
            {...register("name")}
          />
          <Input
            label="Property type"
            hint="e.g. Coffee Estate Stay"
            error={err("type")}
            {...register("type")}
          />
          <Input
            label="Tagline"
            className="sm:col-span-2"
            error={err("tagline")}
            {...register("tagline")}
          />
          <Input
            label="Area"
            hint="e.g. Mallandur"
            error={err("area")}
            {...register("area")}
          />
          <Input
            label="Price per night (₹)"
            type="number"
            mono
            error={err("basePricePerNight")}
            {...register("basePricePerNight")}
          />
          <Input
            label="Rooms"
            type="number"
            mono
            error={err("bedrooms")}
            {...register("bedrooms")}
          />
          <Input
            label="Bathrooms"
            type="number"
            mono
            error={err("bathrooms")}
            {...register("bathrooms")}
          />
          <Input
            label="Max guests"
            type="number"
            mono
            error={err("maxGuests")}
            {...register("maxGuests")}
          />
          <div />
          <Input
            label="Check-in time"
            error={err("checkInTime")}
            {...register("checkInTime")}
          />
          <Input
            label="Check-out time"
            error={err("checkOutTime")}
            {...register("checkOutTime")}
          />
        </div>
      </Section>

      {/* 3 · Location */}
      <Section
        title="Location"
        description="Address is shared after booking; coordinates power directions."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full address"
            className="sm:col-span-2"
            error={err("addressLine")}
            {...register("addressLine")}
          />
          <Input
            label="Google Maps URL"
            className="sm:col-span-2"
            placeholder="https://maps.app.goo.gl/…"
            error={err("mapsUrl")}
            {...register("mapsUrl")}
          />
          <Input
            label="Latitude"
            type="number"
            mono
            error={err("latitude")}
            {...register("latitude")}
          />
          <Input
            label="Longitude"
            type="number"
            mono
            error={err("longitude")}
            {...register("longitude")}
          />
          <Input
            label="Distance from town (km)"
            type="number"
            mono
            error={err("distanceFromTownKm")}
            {...register("distanceFromTownKm")}
          />
          <Input
            label="Acres"
            type="number"
            mono
            error={err("acres")}
            {...register("acres")}
          />
        </div>
      </Section>

      {/* 4 · Story */}
      <Section
        title="Story"
        description="The narrative shown on the stay page."
      >
        <div className="flex flex-col gap-4">
          <Textarea
            label="Story"
            rows={6}
            error={err("story")}
            {...register("story")}
          />
          <Textarea
            label="Short excerpt (for cards)"
            rows={2}
            error={err("storyExcerpt")}
            {...register("storyExcerpt")}
          />
        </div>
      </Section>

      {/* 5 · Amenities */}
      <Section title="Amenities" description="What the property offers.">
        <Controller
          control={control}
          name="amenityIds"
          render={({ field }) => {
            const set = new Set(field.value ?? []);
            const toggle = (id: string) => {
              const next = new Set(set);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              field.onChange([...next]);
            };
            return (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {amenities.map((a) => (
                  <label
                    key={a.id}
                    className="border-border hover:bg-paper-2/50 flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={set.has(a.id)}
                      onChange={() => toggle(a.id)}
                      className="accent-clay size-4"
                    />
                    <span className="text-bark truncate">{a.name}</span>
                  </label>
                ))}
              </div>
            );
          }}
        />
      </Section>

      {/* 6 · Photos */}
      <Section
        title="Photos"
        description="The cover is the card image. Add a gallery, and the food menu as a photo."
      >
        <div className="grid gap-6">
          <div className="sm:max-w-md">
            <Label>Cover photo</Label>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <ImageField
                  value={field.value ?? null}
                  onChange={field.onChange}
                  kind="cover"
                  aspect="aspect-[16/10]"
                />
              )}
            />
          </div>
          <div>
            <Label>Gallery</Label>
            <Controller
              control={control}
              name="gallery"
              render={({ field }) => (
                <GalleryField
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="sm:max-w-md">
            <Label>Food menu (photo)</Label>
            <Controller
              control={control}
              name="menuImageRef"
              render={({ field }) => (
                <ImageField
                  value={field.value ?? null}
                  onChange={field.onChange}
                  kind="menu"
                  aspect="aspect-[3/4]"
                />
              )}
            />
          </div>
        </div>
      </Section>

      {/* 7 · Trust & publishing */}
      <Section
        title="Trust & publishing"
        description="Inspection, status and SEO."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="status">Status</Label>
            <select id="status" className={SELECT} {...register("status")}>
              {STAY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="verification">Verification</Label>
            <select
              id="verification"
              className={SELECT}
              {...register("verification")}
            >
              {VERIFICATIONS.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0) + v.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Fit score (0–100)"
            type="number"
            mono
            error={err("fitScore")}
            {...register("fitScore")}
          />
          <Input
            label="Inspected by"
            error={err("inspectedBy")}
            {...register("inspectedBy")}
          />
          <Input
            label="Inspected on"
            type="date"
            error={err("inspectedOn")}
            {...register("inspectedOn")}
          />
          <div />
          <Input
            label="Caretaker name"
            error={err("caretakerName")}
            {...register("caretakerName")}
          />
          <Input
            label="Caretaker phone (private)"
            error={err("caretakerPhone")}
            {...register("caretakerPhone")}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Cancellation policy"
              rows={2}
              error={err("cancellationPolicy")}
              {...register("cancellationPolicy")}
            />
          </div>
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
          <label className="text-bark flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2">
            <input
              type="checkbox"
              className="accent-clay size-4"
              {...register("isFeatured")}
            />
            Feature on the home page
          </label>
        </div>
      </Section>

      {/* Submit bar */}
      <div className="border-border bg-card/95 sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
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
          {mode === "create" ? "Create stay" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
