import type { Metadata } from "next";
import { LegalDocument } from "@/components/marketing/LegalDocument";
import { LEGAL_UPDATED, PRIVACY_SECTIONS } from "@/lib/legal-content";

const DESCRIPTION =
  "How Stayze handles your personal information — what we collect when you book, why, and the choices you have. Written plainly.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "/privacy",
    title: "Privacy Policy · Stayze",
    description: DESCRIPTION,
  },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updatedOn={LEGAL_UPDATED}
      intro="Your privacy matters, and we keep what we collect to the minimum a booking needs. This policy explains what that is, in plain language."
      sections={PRIVACY_SECTIONS}
    />
  );
}
