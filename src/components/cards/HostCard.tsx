import type { OwnerPublicView } from "@/services/types";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * HostCard — "Meet your host".
 *
 * Photo, name, an eyebrow, the bio, spoken languages and location. The
 * `OwnerPublicView` DTO deliberately carries **no phone or email** — those
 * columns never leave the server — so there is nothing to render by accident
 * here, and nothing added. When the owner has opted out of a public profile the
 * caller passes no `owner` and this renders nothing at all.
 */
export function HostCard({
  owner,
  eyebrow = "Your host",
  className,
}: {
  owner: OwnerPublicView | null;
  eyebrow?: string;
  className?: string;
}) {
  if (!owner) return null;

  return (
    <article
      className={cn(
        "card-surface flex flex-col gap-4 p-5 sm:flex-row",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Avatar src={owner.photoUrl} name={owner.name} size="lg" />
        {owner.hostingSince !== null && (
          <Badge tone="mist" className="whitespace-nowrap">
            Hosting since <span className="num ml-1">{owner.hostingSince}</span>
          </Badge>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="eyebrow text-mist">{eyebrow}</p>
        <h3 className="heading-3 text-bark mt-1">{owner.name}</h3>

        {owner.bio && (
          <p className="text-ink/90 mt-2 text-sm leading-relaxed">
            {owner.bio}
          </p>
        )}

        {owner.languages.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {owner.languages.map((language) => (
              <li key={language}>
                <Tag>{language}</Tag>
              </li>
            ))}
          </ul>
        )}

        {owner.location && (
          <p className="text-muted-ink mt-3 text-xs">{owner.location}</p>
        )}
      </div>
    </article>
  );
}
