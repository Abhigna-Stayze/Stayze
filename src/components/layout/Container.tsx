import { cn } from "@/lib/utils";

/**
 * The page container — content held to ~1200px with responsive gutters.
 *
 * A thin wrapper over the `.container-page` utility so every shell piece and
 * future page shares one width and one set of margins. Renders a plain <div>
 * by default; pass `asChild`-style semantics by choosing the element via `as`.
 */
export function Container({
  className,
  as: Tag = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: React.ElementType }) {
  return <Tag className={cn("container-page", className)} {...props} />;
}
