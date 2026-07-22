import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getStayForAdmin,
  getAmenityOptions,
  type AdminStayDetail,
} from "@/services/admin-stay.service";
import { getExperienceOptions } from "@/services/admin-experience.service";
import {
  emptyStayForm,
  type StayFormValues,
  type StayStatusValue,
} from "@/lib/stay-form";
import { StayEditorTabs } from "@/components/admin/stays/StayEditorTabs";

export const metadata: Metadata = {
  title: "Edit stay",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

/** Map the stored detail into the form's value shape (Dates → strings, etc.). */
function detailToForm(s: AdminStayDetail): StayFormValues {
  const hero = s.images.find((i) => i.isHero) ?? null;
  const rest = s.images.filter((i) => !i.isHero);
  const img = (i: (typeof s.images)[number]) => ({
    bucket: i.bucket,
    path: i.path,
    url: i.url,
    altText: i.altText,
    caption: i.caption,
    width: i.width,
    height: i.height,
  });
  const media = (
    m: { bucket: string; path: string; url: string | null } | null,
  ) => (m ? { bucket: m.bucket, path: m.path, url: m.url } : null);
  // The form's status select is Draft/Published/Hidden; treat legacy ARCHIVED
  // as Hidden.
  const status: StayStatusValue =
    s.status === "PUBLISHED" || s.status === "DRAFT" || s.status === "HIDDEN"
      ? (s.status as StayStatusValue)
      : "HIDDEN";

  return {
    ...emptyStayForm,
    ownerName: s.ownerName,
    ownerPhone: s.ownerPhone ?? "",
    ownerBio: s.ownerBio ?? "",
    ownerPhotoRef: s.ownerPhotoRef
      ? { ...s.ownerPhotoRef, url: s.ownerPhotoUrl }
      : null,
    name: s.name,
    type: s.type,
    tagline: s.tagline ?? "",
    area: s.area,
    addressLine: s.addressLine ?? "",
    mapsUrl: s.mapsUrl ?? "",
    latitude: s.latitude,
    longitude: s.longitude,
    story: s.story,
    storyExcerpt: s.storyExcerpt ?? "",
    basePricePerNight: s.basePricePerNight,
    bedrooms: s.bedrooms,
    bathrooms: s.bathrooms,
    maxGuests: s.maxGuests,
    acres: s.acres,
    distanceFromTownKm: s.distanceFromTownKm,
    checkInTime: s.checkInTime,
    checkOutTime: s.checkOutTime,
    amenityIds: s.amenityIds,
    status,
    verification: s.verification === "VERIFIED" ? "VERIFIED" : "DIRECTORY",
    fitScore: s.fitScore,
    inspectedBy: s.inspectedBy ?? "",
    inspectedOn: s.inspectedOn
      ? new Date(s.inspectedOn).toISOString().slice(0, 10)
      : null,
    caretakerName: s.caretakerName ?? "",
    caretakerPhone: s.caretakerPhone ?? "",
    cancellationPolicy: s.cancellationPolicy ?? "",
    isFeatured: s.isFeatured,
    metaTitle: s.metaTitle ?? "",
    metaDescription: s.metaDescription ?? "",
    slug: s.slug,
    highlights: s.highlights.map((h) => ({
      label: h.label,
      icon: h.icon ?? "",
    })),
    rooms: s.rooms.map((r) => ({
      name: r.name,
      description: r.description ?? "",
      bedType: r.bedType ?? "",
      maxGuests: r.maxGuests,
      image: media(r.image),
    })),
    nearbyPlaces: s.nearbyPlaces.map((p) => ({
      name: p.name,
      category:
        p.category as StayFormValues["nearbyPlaces"][number]["category"],
      description: p.description ?? "",
      distanceKm: p.distanceKm,
      driveTimeMinutes: p.driveTimeMinutes,
      mapsUrl: p.mapsUrl ?? "",
      image: media(p.image),
    })),
    experienceIds: s.experienceIds,
    coverImage: hero ? img(hero) : null,
    gallery: rest.map(img),
    menuImageRef: s.menuImageRef
      ? { ...s.menuImageRef, url: s.menuImageUrl }
      : null,
  };
}

/**
 * Edit a stay — every field. A Server Component reads the full detail (all
 * statuses, private fields) and the amenity options, maps them to form defaults,
 * and hands them to the same `StayForm` the create page uses.
 */
export default async function EditStayPage({ params }: { params: Params }) {
  const { id } = await params;
  const [stay, amenities, experiences] = await Promise.all([
    getStayForAdmin(id),
    getAmenityOptions(),
    getExperienceOptions(),
  ]);
  if (!stay) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/admin/stays/${stay.id}`}
        className="text-muted-ink hover:text-bark inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to {stay.name}
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-1 text-bark">Edit stay</h1>
          <p className="text-muted-ink mt-1.5">
            <span className="num">{stay.propertyCode}</span> · {stay.name}
          </p>
        </div>
        <a
          href={`/stays/${stay.slug}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border text-bark hover:bg-paper-2 inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium"
        >
          Preview
        </a>
      </div>

      <div className="mt-6">
        <StayEditorTabs
          stayId={stay.id}
          defaultValues={detailToForm(stay)}
          amenities={amenities}
          experiences={experiences}
        />
      </div>
    </div>
  );
}
