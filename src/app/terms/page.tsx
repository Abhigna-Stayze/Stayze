import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing/LegalDocument";
import { LEGAL_UPDATED, TERMS_SECTIONS } from "@/lib/legal-content";

const DESCRIPTION =
  "The terms for using Stayze — what the service is, how bookings and pricing work, and the responsibilities on both sides. Written plainly.";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: "/terms",
    title: "Terms & Conditions · Stayze",
    description: DESCRIPTION,
  },
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      updatedOn={LEGAL_UPDATED}
      intro="These terms explain what Stayze is, how booking works, and what to expect from us and from you. By using the site you agree to them."
      sections={TERMS_SECTIONS}
    />
  );
}
