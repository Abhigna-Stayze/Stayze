import { createElement } from "react";
import {
  Bath,
  BedDouble,
  Car,
  Check,
  Coffee,
  Dog,
  Flame,
  Leaf,
  type LucideIcon,
  Mountain,
  Snowflake,
  Sparkles,
  Trees,
  Tv,
  Utensils,
  Waves,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Maps an amenity to a Lucide glyph.
 *
 * The API's `Amenity.icon` is a free-ish string and may be null, so this
 * resolves by keyword against both the `icon` hint and the amenity `name`,
 * falling back to a neutral tick. Keeping the mapping here means a stay page
 * lists amenities without a giant switch inline, and a new amenity name gets a
 * sensible glyph for free.
 */
const RULES: Array<[RegExp, LucideIcon]> = [
  [/wifi|internet|wi-fi/i, Wifi],
  [/coffee|estate|plantation/i, Coffee],
  [/bonfire|fire|campfire|hearth/i, Flame],
  [/breakfast|meal|food|dining|kitchen/i, Utensils],
  [/pool|swim|water/i, Waves],
  [/bath|shower|geyser|hot water/i, Bath],
  [/bed|room|linen/i, BedDouble],
  [/park|car|drive|garage/i, Car],
  [/pet|dog/i, Dog],
  [/ac|air.?condition|cooling/i, Snowflake],
  [/tv|television|netflix/i, Tv],
  [/view|hill|mountain|valley|trek/i, Mountain],
  [/garden|trees|forest|nature/i, Trees],
  [/organic|farm|leaf|green/i, Leaf],
  [/clean|housekeep|service/i, Sparkles],
];

function resolveIcon(name: string, icon?: string | null): LucideIcon {
  const haystack = `${icon ?? ""} ${name}`;
  for (const [pattern, Glyph] of RULES) {
    if (pattern.test(haystack)) return Glyph;
  }
  return Check;
}

/**
 * AmenityIcon — the glyph for a single amenity. Purely presentational; pass the
 * amenity's `name` (and optional `icon` hint) and it picks the right symbol.
 */
export function AmenityIcon({
  name,
  icon,
  className,
}: {
  name: string;
  icon?: string | null;
  className?: string;
}) {
  // `createElement` (not `<Glyph/>`) because the icon is chosen at runtime: the
  // resolved value is always one of the stable module-level Lucide components,
  // never a component defined during render.
  const glyph = resolveIcon(name, icon);
  return createElement(glyph, {
    className: cn("text-mist size-5", className),
    "aria-hidden": true,
  });
}
