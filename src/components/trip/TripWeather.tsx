import { CloudSun } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

/**
 * One day of a forecast. This is the shape the weather integration will return;
 * the component is built to render it, so wiring it up later is a data change,
 * not a layout change.
 */
export type TripWeatherDay = {
  /** ISO date, e.g. "2026-08-14". */
  date: string;
  /** Short weekday, e.g. "Thu". */
  label: string;
  tempMinC: number;
  tempMaxC: number;
  /** A short human condition, e.g. "Light rain". */
  condition: string;
};

export type TripWeatherForecast = { days: TripWeatherDay[] };

/**
 * Weather — integration-ready, not yet integrated.
 *
 * The MVP shows a calm fallback; the section is shaped so `GET
 * /api/trip/[reference]/weather` can drop straight in. When a `forecast`
 * arrives it renders the 7-day strip; until then it explains that the forecast
 * unlocks nearer the stay and shows the strip's silhouette so nothing shifts
 * when the real data lands.
 *
 * **To wire it up later:** add the route, fetch it (a client island, or the
 * server helper if it can be cached briefly), and pass `forecast`. No layout
 * here changes.
 */
export function TripWeather({
  area,
  checkIn,
  forecast,
}: {
  area: string;
  checkIn: Date;
  forecast?: TripWeatherForecast | null;
}) {
  const daysUntil = Math.max(
    0,
    Math.round(
      (new Date(
        checkIn.getFullYear(),
        checkIn.getMonth(),
        checkIn.getDate(),
      ).getTime() -
        new Date().setHours(0, 0, 0, 0)) /
        86_400_000,
    ),
  );

  return (
    <section aria-labelledby="weather-heading">
      <SectionHeading
        id="weather-heading"
        title="Weather"
        subtitle={`For ${area}, around your dates`}
      />

      {forecast && forecast.days.length > 0 ? (
        <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-7">
          {forecast.days.map((day) => (
            <li
              key={day.date}
              className="card-surface flex flex-col items-center gap-1 p-3 text-center"
            >
              <span className="eyebrow text-muted-ink">{day.label}</span>
              <CloudSun className="text-mist my-1 size-6" aria-hidden />
              <span className="num text-bark text-sm font-medium">
                {Math.round(day.tempMaxC)}°
              </span>
              <span className="num text-muted-ink text-xs">
                {Math.round(day.tempMinC)}°
              </span>
              <span className="text-muted-ink mt-0.5 text-[11px] leading-tight">
                {day.condition}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-surface mt-5 p-5">
          <div className="flex items-start gap-3">
            <CloudSun
              className="text-mist mt-0.5 size-5 shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-bark text-sm font-medium">
                The forecast unlocks about a week before you arrive.
              </p>
              <p className="text-muted-ink mt-1 text-sm">
                {daysUntil > 0 ? (
                  <>
                    Your stay is in <span className="num">{daysUntil}</span>{" "}
                    {daysUntil === 1 ? "day" : "days"}. Chikmagalur is mild
                    year-round — cool mornings, warm afternoons, and rain worth
                    planning for from June to September.
                  </>
                ) : (
                  <>
                    Chikmagalur is mild year-round — cool mornings, warm
                    afternoons, and rain worth planning for from June to
                    September.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* The strip's silhouette, so the real forecast lands without a jump. */}
          <ul aria-hidden className="mt-4 hidden grid-cols-7 gap-2 sm:grid">
            {Array.from({ length: 7 }, (_, i) => (
              <li
                key={i}
                className="border-border/70 flex flex-col items-center gap-2 rounded-md border border-dashed p-3"
              >
                <span className="bg-paper-2 h-2.5 w-6 rounded-full" />
                <span className="bg-paper-2 size-6 rounded-full" />
                <span className="bg-paper-2 h-2.5 w-5 rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
