import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, MapPin, Pencil } from "lucide-react";
import {
  getStayForAdmin,
  getAmenityOptions,
} from "@/services/admin-stay.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatItem } from "@/components/shared/StatItem";
import { formatPrice } from "@/components/ui/price";
import { StatusBadge } from "@/components/admin/stays/StatusBadge";
import { StayRowActions } from "@/components/admin/stays/StayRowActions";

export const metadata: Metadata = {
  title: "Stay",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

function fmt(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * View a stay — the full record, read-only, with quick actions. A Server
 * Component reading the admin detail (all statuses, private owner contact).
 */
export default async function ViewStayPage({ params }: { params: Params }) {
  const { id } = await params;
  const [stay, amenities] = await Promise.all([
    getStayForAdmin(id),
    getAmenityOptions(),
  ]);
  if (!stay) notFound();

  const amenityNames = amenities
    .filter((a) => stay.amenityIds.includes(a.id))
    .map((a) => a.name);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/stays"
        className="text-muted-ink hover:text-bark inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All stays
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-1 text-bark">{stay.name}</h1>
            <StatusBadge status={stay.status} />
            {stay.isFeatured && <Badge tone="gold">Featured</Badge>}
          </div>
          <p className="text-muted-ink mt-1.5">
            <span className="num">{stay.propertyCode}</span> · {stay.type} ·{" "}
            {stay.area}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stay.status === "PUBLISHED" && (
            <Button asChild variant="outline">
              <a
                href={`/stays/${stay.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden />
                View live
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href={`/admin/stays/${stay.id}/edit`}>
              <Pencil className="size-4" aria-hidden />
              Edit
            </Link>
          </Button>
          <StayRowActions id={stay.id} name={stay.name} status={stay.status} />
        </div>
      </header>

      {/* Gallery */}
      {stay.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stay.images.map((img) => (
            <div
              key={img.id}
              className="border-border relative aspect-[4/3] overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url ?? ""}
                alt=""
                className="size-full object-cover"
              />
              {img.isHero && (
                <span className="bg-card/90 text-bark absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[0.625rem] font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="card-surface p-5">
            <h2 className="heading-3 text-bark">Story</h2>
            <p className="text-bark/90 mt-3 leading-relaxed whitespace-pre-line">
              {stay.story}
            </p>
          </section>

          {amenityNames.length > 0 && (
            <section className="card-surface p-5">
              <h2 className="heading-3 text-bark">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenityNames.map((name) => (
                  <Badge key={name} tone="neutral">
                    {name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {stay.menuImageUrl && (
            <section className="card-surface p-5">
              <h2 className="heading-3 text-bark">Food menu</h2>
              <div className="border-border mt-3 max-w-xs overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stay.menuImageUrl}
                  alt="Food menu"
                  className="w-full"
                />
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section className="card-surface p-5">
            <h2 className="heading-3 text-bark">Details</h2>
            <div className="mt-4 flex flex-col gap-3">
              <StatItem
                label="Price / night"
                value={formatPrice(stay.basePricePerNight, stay.currency)}
              />
              <StatItem label="Rooms" value={stay.bedrooms} />
              <StatItem label="Bathrooms" value={stay.bathrooms} />
              <StatItem label="Max guests" value={stay.maxGuests} />
              <StatItem
                label="Check-in"
                value={stay.checkInTime}
                mono={false}
              />
              <StatItem
                label="Check-out"
                value={stay.checkOutTime}
                mono={false}
              />
              {stay.fitScore !== null && (
                <StatItem label="Fit score" value={stay.fitScore} />
              )}
              <StatItem
                label="Verification"
                value={stay.verification}
                mono={false}
              />
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="heading-3 text-bark">Owner</h2>
            <div className="mt-4 flex items-center gap-3">
              {stay.ownerPhotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stay.ownerPhotoUrl}
                  alt={stay.ownerName}
                  className="border-border size-12 rounded-full border object-cover"
                />
              )}
              <div>
                <p className="text-bark font-medium">{stay.ownerName}</p>
                {stay.ownerPhone && (
                  <p className="num text-muted-ink text-sm">
                    {stay.ownerPhone}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="heading-3 text-bark">Location</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {stay.addressLine && (
                <p className="text-bark/90 flex items-start gap-2">
                  <MapPin
                    className="text-mist mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  {stay.addressLine}
                </p>
              )}
              {stay.mapsUrl && (
                <a
                  href={stay.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-clay inline-flex items-center gap-1 underline underline-offset-2"
                >
                  Google Maps
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          </section>

          <section className="card-surface text-muted-ink p-5 text-xs">
            <p>
              Created <span className="num">{fmt(stay.createdAt)}</span>
            </p>
            <p className="mt-1">
              Updated <span className="num">{fmt(stay.updatedAt)}</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
