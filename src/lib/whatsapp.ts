/**
 * Build a prefilled wa.me link from a stored WhatsApp number.
 *
 * A pure helper — no server-only imports — so both Server Components (the
 * footer) and Client Components (the floating help button) can use it. The
 * number is normalised to digits, since wa.me rejects '+', spaces and dashes.
 * Returns null when there is no number, so callers render nothing rather than a
 * broken link.
 */
export function whatsappLink(
  whatsappNumber: string | null | undefined,
  message?: string,
): string | null {
  if (!whatsappNumber) return null;
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
