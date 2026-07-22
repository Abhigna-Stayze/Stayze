import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getStayForAdmin,
  getAmenityOptions,
  type AdminStayDetail,
} from "@/services/admin-stay.service";
import {
  emptyStayForm,
  type StayFormValues,
  type StayStatusValue,
} from "@/lib/stay-form";
import { StayForm } from "@/components/admin/stays/StayForm";

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
    width: i.width,
    height: i.height,
  });
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
  const [stay, amenities] = await Promise.all([
    getStayForAdmin(id),
    getAmenityOptions(),
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
      <h1 className="heading-1 text-bark mt-3">Edit stay</h1>
      <p className="text-muted-ink mt-1.5">
        <span className="num">{stay.propertyCode}</span> · {stay.name}
      </p>

      <div className="mt-6">
        <StayForm
          mode="edit"
          stayId={stay.id}
          defaultValues={detailToForm(stay)}
          amenities={amenities}
        />
      </div>
    </div>
  );
}
