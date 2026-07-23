import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * The admin dashboard's data — counts, things needing attention, and a recent
 * activity feed.
 *
 * Built only from models that already exist. In particular there is **no audit
 * log table**, so "recent activity" is not a recorded event stream: it is
 * derived from the timestamps the schema already keeps (`BookingRequest`
 * created, `Stay` updated, `Experience` updated, `ContactMessage` created) and
 * merged into one list. That is honest about what the database knows — it shows
 * what changed and when, not who changed it.
 *
 * Two models are deliberately absent from the feed: `Review` and `TravelGuide`
 * have no created/updated column to order by.
 */

/** The seeded placeholder. Booking works, but every enquiry goes nowhere real. */
const PLACEHOLDER_WHATSAPP = "910000000000";

export type DashboardStat = {
  label: string;
  value: number;
  note: string;
  href: string | null;
};

export type DashboardAlert = {
  label: string;
  count: number | null;
  href: string | null;
  tone: "warn" | "info";
};

export type ActivityItem = {
  kind: "BOOKING" | "STAY" | "EXPERIENCE" | "MESSAGE";
  title: string;
  detail: string;
  at: Date;
  href: string | null;
};

export type DashboardData = {
  stats: DashboardStat[];
  alerts: DashboardAlert[];
  activity: ActivityItem[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const [
    stayTotal,
    stayPublished,
    stayDraft,
    bookingTotal,
    bookingNew,
    experienceTotal,
    experiencePublished,
    guideTotal,
    guidePublished,
    pendingReviews,
    settings,
    recentBookings,
    recentStays,
    recentExperiences,
    recentMessages,
  ] = await Promise.all([
    prisma.stay.count({ where: { deletedAt: null } }),
    prisma.stay.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.stay.count({ where: { deletedAt: null, status: "DRAFT" } }),
    prisma.bookingRequest.count(),
    prisma.bookingRequest.count({ where: { status: "NEW" } }),
    prisma.experience.count(),
    prisma.experience.count({ where: { isPublished: true } }),
    prisma.travelGuide.count(),
    prisma.travelGuide.count({ where: { isPublished: true } }),
    prisma.review.count({ where: { isPublished: false } }),
    prisma.siteSetting.findUnique({
      where: { id: "default" },
      select: { whatsappNumber: true },
    }),
    prisma.bookingRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        reference: true,
        guestName: true,
        status: true,
        createdAt: true,
        stay: { select: { name: true } },
      },
    }),
    prisma.stay.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, name: true, status: true, updatedAt: true },
    }),
    prisma.experience.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, title: true, isPublished: true, updatedAt: true },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { name: true, channel: true, createdAt: true },
    }),
  ]);

  const stats: DashboardStat[] = [
    {
      label: "Stays",
      value: stayTotal,
      note: `${stayPublished} published`,
      href: "/admin/stays",
    },
    {
      label: "Bookings",
      value: bookingTotal,
      note: bookingNew > 0 ? `${bookingNew} new` : "None new",
      // No bookings module yet — nowhere to send them.
      href: null,
    },
    {
      label: "Experiences",
      value: experienceTotal,
      note: `${experiencePublished} published`,
      href: "/admin/experiences",
    },
    {
      label: "Travel guides",
      value: guideTotal,
      note: `${guidePublished} published`,
      href: null,
    },
  ];

  const alerts: DashboardAlert[] = [];
  if (!settings || settings.whatsappNumber === PLACEHOLDER_WHATSAPP) {
    alerts.push({
      label: settings
        ? "The booking WhatsApp number is still the placeholder"
        : "No site settings yet — set the booking WhatsApp number",
      count: null,
      href: "/admin/settings",
      tone: "warn",
    });
  }
  if (pendingReviews > 0) {
    alerts.push({
      label: "Reviews waiting to be moderated",
      count: pendingReviews,
      href: "/admin/stays",
      tone: "warn",
    });
  }
  if (bookingNew > 0) {
    alerts.push({
      label: "New booking requests",
      count: bookingNew,
      href: null,
      tone: "info",
    });
  }
  if (stayDraft > 0) {
    alerts.push({
      label: "Stays still in draft",
      count: stayDraft,
      href: "/admin/stays?status=DRAFT",
      tone: "info",
    });
  }
  const experienceDraft = experienceTotal - experiencePublished;
  if (experienceDraft > 0) {
    alerts.push({
      label: "Experiences still in draft",
      count: experienceDraft,
      href: "/admin/experiences?status=draft",
      tone: "info",
    });
  }

  const activity: ActivityItem[] = [
    ...recentBookings.map((b) => ({
      kind: "BOOKING" as const,
      title: `${b.guestName} enquired about ${b.stay.name}`,
      detail: `${b.reference} · ${title(b.status)}`,
      at: b.createdAt,
      href: null,
    })),
    ...recentStays.map((s) => ({
      kind: "STAY" as const,
      title: `${s.name} was updated`,
      detail: title(s.status),
      at: s.updatedAt,
      href: `/admin/stays/${s.id}/edit`,
    })),
    ...recentExperiences.map((e) => ({
      kind: "EXPERIENCE" as const,
      title: `${e.title} was updated`,
      detail: e.isPublished ? "Published" : "Draft",
      at: e.updatedAt,
      href: `/admin/experiences/${e.id}/edit`,
    })),
    ...recentMessages.map((m) => ({
      kind: "MESSAGE" as const,
      title: `${m.name} sent a message`,
      detail: title(m.channel),
      at: m.createdAt,
      href: null,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  return { stats, alerts, activity };
}

/** SCREAMING_CASE -> Title case, for statuses shown to a human. */
function title(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
