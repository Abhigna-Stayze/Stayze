import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-9",
  md: "size-12",
  lg: "size-16",
} as const;

/** First letters of the first two words — "Yogesh & family" → "YF". */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Avatar — a circular portrait with an initials fallback.
 *
 * Used for a host and a review author. When there is no photo (`src` null) it
 * falls back to the person's initials on a paper-2 well, never a broken image.
 * `name` is required — it is both the alt text and the fallback source.
 */
export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src: string | null | undefined;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const dimension = size === "sm" ? 36 : size === "lg" ? 64 : 48;

  return (
    <span
      className={cn(
        "border-border bg-paper-2 relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border",
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={dimension}
          height={dimension}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="text-bark/70 font-serif text-sm"
          aria-label={name}
          role="img"
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
