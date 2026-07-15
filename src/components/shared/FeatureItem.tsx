import { createElement, isValidElement, type ElementType } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FeatureItem — an icon paired with a label and optional line of copy.
 *
 * Two shapes from one component:
 *  - **row** (default) — icon left, text right: an amenity in a list, a
 *    "why you'll love it" highlight.
 *  - **stack** — icon above centred text: the "Why Stayze" columns on Home
 *    (Verified / Curated / Supported).
 *
 * The `icon` can be a Lucide component or any node (e.g. an `AmenityIcon`).
 */
export function FeatureItem({
  icon,
  title,
  description,
  layout = "row",
  className,
}: {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  layout?: "row" | "stack";
  className?: string;
}) {
  // `icon` may be a component *type* (a Lucide icon — a function or a forwardRef
  // object) or an already-built element (e.g. `<AmenityIcon … />`). Render a
  // ready element as-is; instantiate a component type with the brand styling.
  const glyph = !icon
    ? null
    : isValidElement(icon)
      ? icon
      : createElement(icon as ElementType, {
          className: "text-mist size-5",
          "aria-hidden": true,
        });

  if (layout === "stack") {
    return (
      <div className={cn("flex flex-col items-center text-center", className)}>
        {icon && (
          <span className="bg-mist/12 text-mist mb-3 inline-flex size-11 items-center justify-center rounded-full">
            {glyph}
          </span>
        )}
        <h3 className="heading-3 text-bark">{title}</h3>
        {description && (
          <p className="text-muted-ink mt-1.5 text-sm">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon && <span className="mt-0.5 shrink-0">{glyph}</span>}
      <div>
        <p className="text-bark text-sm font-medium">{title}</p>
        {description && (
          <p className="text-muted-ink mt-0.5 text-sm">{description}</p>
        )}
      </div>
    </div>
  );
}
