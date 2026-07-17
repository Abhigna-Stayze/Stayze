"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhatsappIcon } from "@/components/icons/WhatsappIcon";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * ContactForm — a real, working enquiry form without a contact endpoint.
 *
 * There is no contact API (and building one would mean a spam surface with no
 * moderation yet), so instead of a dead "submit" this composes what you type
 * into a message and hands off to the channel we actually answer on: WhatsApp,
 * with an email fallback. It is honest — the button says where it goes — and it
 * lands the enquiry in the same place a booking would. Minimal client state;
 * validates only that there's a name and a message before it can send.
 */
export function ContactForm({
  whatsappNumber,
  supportEmail,
}: {
  whatsappNumber: string | null;
  supportEmail: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const ready = name.trim() !== "" && message.trim() !== "";

  const composed =
    `Hi Stayze! My name is ${name.trim()}.` +
    (email.trim() ? ` My email is ${email.trim()}.` : "") +
    `\n\n${message.trim()}`;

  const wa = whatsappLink(whatsappNumber, composed);
  const mailto = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent(
        `Enquiry from ${name.trim() || "a visitor"}`,
      )}&body=${encodeURIComponent(composed)}`
    : null;

  // No endpoint to POST to — the "send" links carry the composed message to the
  // channel we answer on. If the form isn't ready, block the hand-off and show
  // the field errors instead of opening a half-written message.
  const guard = (e: React.MouseEvent) => {
    if (!ready) {
      e.preventDefault();
      setTouched(true);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Input
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Priya"
        autoComplete="name"
        error={
          touched && name.trim() === "" ? "Please add your name." : undefined
        }
      />
      <Input
        label="Email (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        hint="Only if you'd prefer we reply by email."
      />
      <Textarea
        label="How can we help?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about the trip you have in mind — dates, who's coming, what you're after."
        rows={5}
        error={
          touched && message.trim() === ""
            ? "Please add a short message."
            : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        {wa && (
          <Button asChild onClick={guard} aria-disabled={!ready}>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={ready ? undefined : "opacity-60"}
            >
              <WhatsappIcon className="size-4" />
              Send on WhatsApp
            </a>
          </Button>
        )}
        {mailto && (
          <Button
            asChild
            variant="outline"
            onClick={guard}
            aria-disabled={!ready}
          >
            <a href={mailto} className={ready ? undefined : "opacity-60"}>
              <Mail className="size-4" aria-hidden />
              Email instead
            </a>
          </Button>
        )}
      </div>
      <p className="text-muted-ink text-xs">
        Your message opens in WhatsApp or your email app, already written —
        nothing is stored on this page.
      </p>
    </form>
  );
}
