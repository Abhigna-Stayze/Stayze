import type { LegalSection } from "@/components/marketing/LegalDocument";

/**
 * Legal copy for the Privacy Policy and Terms pages, as data.
 *
 * Written to describe what the platform *actually* does today — request-to-book
 * over WhatsApp, a name and phone number collected per booking, no accounts, no
 * payment taken through the platform — rather than boilerplate that promises
 * systems Stayze doesn't run. Kept plain and readable. `LEGAL_UPDATED` is the
 * single date both documents show.
 */

export const LEGAL_UPDATED = "17 July 2026";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    blocks: [
      {
        type: "p",
        text: "Stayze helps travellers discover and book handpicked plantation stays in Chikmagalur and the Western Ghats. This policy explains what personal information we collect when you use the site or make a booking enquiry, why we collect it, and the choices you have. We keep what we collect to the minimum a booking needs.",
      },
    ],
  },
  {
    id: "what-we-collect",
    heading: "Information we collect",
    blocks: [
      {
        type: "p",
        text: "We do not run accounts, so there are no passwords or profiles to store. We collect information only when you send us a booking request or get in touch:",
      },
      {
        type: "ul",
        items: [
          "Booking details you give us: your name, mobile number and, where relevant, your travel dates and party size.",
          "Enquiry messages: anything you choose to tell us over WhatsApp, email or a contact form.",
          "Basic technical data: standard server and analytics information such as your device type and pages viewed, used to keep the site working and understand what is useful.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    heading: "How we use your information",
    blocks: [
      {
        type: "ul",
        items: [
          "To respond to your booking request and arrange your stay with the host.",
          "To provide support before, during and after your trip.",
          "To improve the site and the stays we list.",
          "To meet legal or accounting obligations where required.",
        ],
      },
      {
        type: "p",
        text: "We do not sell your personal information, and we do not use it for advertising by third parties.",
      },
    ],
  },
  {
    id: "sharing",
    heading: "When we share it",
    blocks: [
      {
        type: "p",
        text: "We share the minimum necessary, and only with:",
      },
      {
        type: "ul",
        items: [
          "The host of the stay you book, so they can prepare for your arrival and reach you.",
          "Service providers who help us run the site — for example our hosting and database provider — under obligations to protect your data.",
          "Authorities, if the law requires it.",
        ],
      },
    ],
  },
  {
    id: "whatsapp",
    heading: "WhatsApp and messaging",
    blocks: [
      {
        type: "p",
        text: "Most bookings happen over WhatsApp. When you message us there, your use of WhatsApp is also governed by WhatsApp's (Meta's) own privacy terms, which we do not control. The same applies to email and phone calls you make to us.",
      },
    ],
  },
  {
    id: "retention",
    heading: "How long we keep it",
    blocks: [
      {
        type: "p",
        text: "We keep booking records for as long as needed to provide your stay and to meet legal, tax and accounting requirements, then remove or anonymise them. You can ask us to delete your information sooner where we are not required to keep it.",
      },
    ],
  },
  {
    id: "security",
    heading: "How we protect it",
    blocks: [
      {
        type: "p",
        text: "We use reasonable technical and organisational measures to protect your information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security, but we work to keep the risk low.",
      },
    ],
  },
  {
    id: "your-rights",
    heading: "Your choices",
    blocks: [
      {
        type: "p",
        text: "You can ask us to show you the information we hold about you, correct it, or delete it. Because we do not run accounts, the quickest way to do any of this is to message us on the same WhatsApp thread or email we used for your booking, and we will action it.",
      },
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    blocks: [
      {
        type: "p",
        text: "The site uses only the cookies and similar technologies needed to function and to understand basic, aggregate usage. We do not use them to track you across other websites.",
      },
    ],
  },
  {
    id: "children",
    heading: "Children",
    blocks: [
      {
        type: "p",
        text: "Stayze is intended for adults booking travel. We do not knowingly collect information from anyone under 18. If you believe a child has provided us information, contact us and we will remove it.",
      },
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy as the service grows. When we do, we will change the date at the top of this page. Significant changes will be made clear on the site.",
      },
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of these terms",
    blocks: [
      {
        type: "p",
        text: "By using the Stayze website or sending a booking enquiry, you agree to these terms. If you do not agree, please do not use the site.",
      },
    ],
  },
  {
    id: "what-stayze-is",
    heading: "What Stayze is",
    blocks: [
      {
        type: "p",
        text: "Stayze is a curated discovery and booking-facilitation service. We personally visit and select plantation stays in Chikmagalur and connect you with the independent hosts who own and operate them. Except where stated, Stayze is not the owner of the property you book — we help you find it and arrange the stay.",
      },
    ],
  },
  {
    id: "bookings",
    heading: "Bookings and confirmation",
    blocks: [
      {
        type: "ol",
        items: [
          "Bookings are made as a request — typically over WhatsApp. A request is not a confirmed reservation until we or the host confirm it to you.",
          "No payment is taken through the Stayze platform. Any deposit or balance is arranged and settled directly with the host, on the terms they set.",
          "You are responsible for giving accurate booking details, including the number of guests, so the host can prepare correctly.",
        ],
      },
    ],
  },
  {
    id: "pricing",
    heading: "Pricing and estimates",
    blocks: [
      {
        type: "p",
        text: "Prices shown on the site, and any total shown before confirmation, are estimates. Nightly rates can vary by date (for example weekends or festival periods). The final price is the one confirmed by us or the host, and may include applicable taxes and charges.",
      },
    ],
  },
  {
    id: "cancellations",
    heading: "Cancellations and changes",
    blocks: [
      {
        type: "p",
        text: "Each stay has its own cancellation policy, shown or shared before you book. Changes and cancellations are handled with the host through us. Because no payment is taken through Stayze, any refund is a matter between you and the host under that policy.",
      },
    ],
  },
  {
    id: "your-responsibilities",
    heading: "Your responsibilities as a guest",
    blocks: [
      {
        type: "ol",
        items: [
          "Provide accurate information when you enquire or book.",
          "Treat the property, the host and their staff with respect, and follow the house rules of the stay.",
          "Take responsibility for your party, including any guests you bring.",
        ],
      },
    ],
  },
  {
    id: "the-property",
    heading: "The property and the host",
    blocks: [
      {
        type: "p",
        text: "Stays are independently owned and operated. We describe each one in good faith based on our own visit, and we work to keep listings accurate. We cannot, however, guarantee that every detail will be exactly as described at all times, or be responsible for the acts or omissions of a host.",
      },
    ],
  },
  {
    id: "reviews",
    heading: "Reviews and content",
    blocks: [
      {
        type: "p",
        text: "If you leave a review, keep it honest, based on your own stay, and free of unlawful or offensive content. We may decline to publish or may remove content that breaches these terms.",
      },
    ],
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    blocks: [
      {
        type: "p",
        text: "The Stayze name, logo, site design, photography and written guides are our property or used with permission, and may not be copied or reused without our consent.",
      },
    ],
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    blocks: [
      {
        type: "p",
        text: "The site and our service are provided on an “as is” basis. To the fullest extent permitted by law, Stayze is not liable for indirect or consequential loss, or for matters outside our reasonable control, including the conduct of hosts or third-party services. Nothing in these terms limits any liability that cannot be limited by law.",
      },
    ],
  },
  {
    id: "third-parties",
    heading: "Third-party services",
    blocks: [
      {
        type: "p",
        text: "We rely on third-party services such as WhatsApp for messaging. Your use of those services is subject to their own terms, which we do not control.",
      },
    ],
  },
  {
    id: "governing-law",
    heading: "Governing law",
    blocks: [
      {
        type: "p",
        text: "These terms are governed by the laws of India, and the courts of Karnataka have jurisdiction over any dispute, subject to any rights you have under applicable law.",
      },
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    blocks: [
      {
        type: "p",
        text: "We may update these terms as the service grows. The date at the top of this page shows when they last changed; continuing to use the site means you accept the current version.",
      },
    ],
  },
];
