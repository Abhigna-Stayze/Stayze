"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle, Check } from "lucide-react";
import {
  settingsFormSchema,
  type SettingsFormValues,
} from "@/lib/settings-form";
import { updateSiteSettings, type ApiError } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormInput = z.input<typeof settingsFormSchema>;

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

/**
 * Site settings — the single config row, edited through `react-hook-form` +
 * a Zod resolver over the shared `settingsFormSchema`.
 *
 * Small on purpose: `SiteSetting` has four editable columns. The WhatsApp
 * number is the load-bearing one — every booking enquiry is sent to it, and
 * `booking.service` refuses to build a message without it.
 */
export function SettingsForm({
  defaultValues,
}: {
  defaultValues: SettingsFormValues;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: defaultValues as FormInput,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);
    try {
      await updateSiteSettings(values);
      setSaved(true);
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
      {saved && (
        <div
          role="status"
          className="border-mist/40 bg-mist/10 text-mist flex items-center gap-2 rounded-md border px-4 py-3 text-sm"
        >
          <Check className="size-4 shrink-0" aria-hidden />
          Settings saved.
        </div>
      )}

      <Section
        title="Booking"
        description="Where every booking enquiry is sent. Without this the booking flow cannot build a message."
      >
        <div className="sm:max-w-sm">
          <Input
            label="WhatsApp number"
            hint="Country code and number, e.g. 919876543210."
            mono
            error={err("whatsappNumber")}
            {...register("whatsappNumber")}
          />
        </div>
      </Section>

      <Section
        title="Contact"
        description="Shown in the footer and on the Contact page."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Support phone"
            mono
            error={err("supportPhone")}
            {...register("supportPhone")}
          />
          <Input
            label="Support email"
            type="email"
            error={err("supportEmail")}
            {...register("supportEmail")}
          />
        </div>
      </Section>

      <Section title="Social" description="Linked from the footer.">
        <div className="sm:max-w-md">
          <Input
            label="Instagram URL"
            placeholder="https://instagram.com/stayze"
            error={err("instagramUrl")}
            {...register("instagramUrl")}
          />
        </div>
      </Section>

      <div className="border-border bg-card/95 sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          Save settings
        </Button>
      </div>
    </form>
  );
}
