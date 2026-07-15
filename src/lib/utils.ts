import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, with later Tailwind utilities winning over earlier ones.
 *
 * The standard shadcn/ui helper. `clsx` handles conditionals and arrays;
 * `twMerge` resolves conflicts so `cn("px-2", condition && "px-4")` yields a
 * single `px-4` rather than both.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
