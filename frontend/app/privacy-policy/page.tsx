import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { RIPPL_PRIVACY_EMAIL } from "@/lib/privacy-contact"

export const metadata: Metadata = {
  title: "Privacy Policy | Rippl",
  description: "How Rippl collects, uses, and protects your personal information (India).",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-rippl-black text-white selection:bg-rippl-violet selection:text-white font-roboto">
      <header className="border-b border-rippl-black-3 bg-rippl-black/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-6 sm:px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <span className="relative block h-9 w-9 shrink-0 sm:h-10 sm:w-10">
              <Image src="/logo.png" alt="Rippl" fill className="object-contain" sizes="40px" />
            </span>
            <span className="text-xl font-black tracking-tighter sm:text-2xl">
              Rippl<span className="text-rippl-violet">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-rippl-gray transition-colors hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-rippl-violet-soft">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-rippl-gray">
          Effective date: <time dateTime="2026-03-28">28 March 2026</time>. This policy describes how Rippl
          (“Rippl”, “we”, “us”) handles personal data when you use our websites, apps, and related services
          (collectively, the “Services”). We operate with users in India in mind and aim to align with the
          Digital Personal Data Protection Act, 2023 (“DPDP Act”) and applicable rules, alongside other Indian
          laws such as the Information Technology Act, 2000 and the Information Technology (Reasonable Security
          Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (“SPDI Rules”), where
          relevant.
        </p>
        <p className="mt-4 text-sm text-amber-200/90">
          This page is provided for transparency and does not constitute legal advice. Please consult your own
          counsel for compliance matters.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-bold text-white">1. Who this policy covers</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            This policy applies to visitors and registered users of the Services, including creators, clippers,
            brands, and others who interact with Rippl (for example by joining a waitlist, creating an account,
            or browsing our site).
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">2. Personal data we collect</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            Depending on how you use the Services, we may collect:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-rippl-gray">
            <li>
              <span className="font-semibold text-white/90">Identity & contact:</span> name, email address,
              phone number if you provide it, and similar identifiers you submit when you sign up, verify your
              account, or contact us.
            </li>
            <li>
              <span className="font-semibold text-white/90">Account & profile:</span> role (e.g. creator or
              clipper), profile details, preferences, and content you upload or connect where the product allows
              it (such as campaign or submission information).
            </li>
            <li>
              <span className="font-semibold text-white/90">Waitlist / marketing:</span> if you join our waitlist,
              your email, chosen role, and any optional survey responses you submit as part of that flow.
            </li>
            <li>
              <span className="font-semibold text-white/90">Technical & usage:</span> IP address, device and
              browser type, approximate location derived from IP, timestamps, pages viewed, referral URLs, and
              similar diagnostics needed to secure and operate the Services (including fraud prevention and rate
              limiting).
            </li>
            <li>
              <span className="font-semibold text-white/90">Cookies & similar technologies:</span> where we use
              them, for example to keep you signed in, remember preferences, or understand traffic in aggregate.
              You can control cookies through your browser settings; blocking some cookies may affect
              functionality.
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-rippl-gray">
            We do not intend to collect “sensitive personal data or information” as defined under Indian law beyond
            what you voluntarily provide and what is necessary for the Services. Do not submit health, financial
            account details, or government IDs unless we explicitly ask for them for a stated purpose.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">3. How we use personal data</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">We use personal data to:</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-rippl-gray">
            <li>Create and maintain your account and provide the Services you request.</li>
            <li>Process waitlist signups and communicate about early access, product updates, and related offers,
              where permitted.</li>
            <li>Operate campaigns, submissions, payouts, or analytics features offered in the product.</li>
            <li>Protect security, enforce our terms, prevent abuse, and comply with law.</li>
            <li>Improve and develop the Services (including troubleshooting and aggregated analytics).</li>
          </ul>
          <p className="text-sm leading-relaxed text-rippl-gray">
            Where the DPDP Act applies, we rely on appropriate grounds such as your voluntary consent (where
            required), performance of steps at your request before entering a contract, compliance with legal
            obligations, or legitimate uses permitted under law—depending on the activity.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">4. Sharing of personal data</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            We may share personal data with:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-rippl-gray">
            <li>
              <span className="font-semibold text-white/90">Infrastructure & providers:</span> hosting, database,
              authentication, email delivery, analytics, customer support tools, and security vendors who process
              data on our instructions.
            </li>
            <li>
              <span className="font-semibold text-white/90">Professional advisers:</span> lawyers, auditors, or
              accountants where required.
            </li>
            <li>
              <span className="font-semibold text-white/90">Authorities:</span> when required by law, court order,
              or lawful request, or to protect rights, safety, and integrity.
            </li>
            <li>
              <span className="font-semibold text-white/90">Business transfers:</span> in connection with a
              merger, financing, or sale of assets, subject to confidentiality and continued protection of your
              data as required by law.
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-rippl-gray">
            We do not sell your personal data in the conventional sense of exchanging it for money with data
            brokers. Links to third-party sites (for example Discord or social platforms) are governed by those
            parties’ own policies once you leave our Services.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">5. Storage, cross-border transfers & security</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            Your information may be stored on servers located in India and/or other countries where our providers
            operate. Where personal data is transferred outside India, we take steps consistent with applicable law
            (such as contractual safeguards where required).
          </p>
          <p className="text-sm leading-relaxed text-rippl-gray">
            We implement reasonable administrative, technical, and physical safeguards designed to protect personal
            data. No method of transmission over the internet is completely secure; we encourage strong passwords
            and caution when sharing information.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">6. Retention</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            We keep personal data only as long as needed for the purposes above, including legal, accounting, or
            reporting requirements. Retention periods depend on the type of data and whether you still have an
            account with us. When data is no longer needed, we delete or de-identify it subject to applicable
            exceptions.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">7. Your rights (including under the DPDP Act)</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            Depending on applicable law, you may have rights to access, correct, update, or request erasure of your
            personal data; to withdraw consent where processing is consent-based; to nominate another person to
            exercise rights in the event of death or incapacity (as prescribed); and to address grievances through
            our Grievance Officer (see below). You may also have the right to object to certain processing as
            provided by law.
          </p>
          <p className="text-sm leading-relaxed text-rippl-gray">
            To exercise these rights, contact us at{" "}
            <a
              href={`mailto:${RIPPL_PRIVACY_EMAIL}`}
              className="font-semibold text-rippl-violet-soft underline-offset-2 hover:text-white hover:underline"
            >
              {RIPPL_PRIVACY_EMAIL}
            </a>
            . We may need to verify your identity before fulfilling a request.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">8. Grievance Officer (India)</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            For concerns or complaints regarding the processing of your personal data under Indian law, you may
            contact our Grievance Officer:
          </p>
          <p className="rounded-xl border border-rippl-black-3 bg-rippl-black-2/50 p-4 text-sm text-rippl-gray">
            <span className="font-semibold text-white">Grievance Officer (Privacy)</span>
            <br />
            Rippl
            <br />
            Email:{" "}
            <a
              href={`mailto:${RIPPL_PRIVACY_EMAIL}`}
              className="font-semibold text-rippl-violet-soft underline-offset-2 hover:text-white hover:underline"
            >
              {RIPPL_PRIVACY_EMAIL}
            </a>
          </p>
          <p className="text-sm leading-relaxed text-rippl-gray">
            You may also have the right to escalate complaints to the Data Protection Board of India or other
            regulators as prescribed under the DPDP Act when those mechanisms are available.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">9. Children’s privacy</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            The Services are not directed to children, and we do not knowingly collect personal data from anyone
            under eighteen (18) years of age in a manner inconsistent with Indian law. If you are a parent or
            guardian and believe a child has provided us with personal data, please contact us at the email above
            and we will take steps to delete such information where required.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">10. Changes to this policy</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            We may update this Privacy Policy from time to time. The “Effective date” at the top will change when
            we do. For material changes, we will provide notice as appropriate (for example via the Services or
            email). Continued use after the effective date constitutes notice of updates where permitted by law.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-bold text-white">11. Contact</h2>
          <p className="text-sm leading-relaxed text-rippl-gray">
            Questions about this policy:{" "}
            <a
              href={`mailto:${RIPPL_PRIVACY_EMAIL}`}
              className="font-semibold text-rippl-violet-soft underline-offset-2 hover:text-white hover:underline"
            >
              {RIPPL_PRIVACY_EMAIL}
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-rippl-black-3 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-rippl-gray sm:px-6">
          © {new Date().getFullYear()} Rippl.{" "}
          <Link href="/" className="font-medium text-rippl-violet-soft hover:text-white">
            Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
