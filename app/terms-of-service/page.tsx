import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Karim Real Estate website and services.",
};

export default function TermsOfServicePage() {
  return (
    <section className="min-h-screen bg-gradient-to-r from-brand via-[#1f6a4c] to-[#6ea77c] px-3 py-6 sm:px-6 sm:py-14 lg:px-10">
      <div className="w-full bg-white px-4 py-8 text-black sm:px-10 sm:py-12 lg:px-16 lg:py-14">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">Terms of Service</h1>

        <p className="mt-5 text-sm font-semibold sm:text-lg">Effective Date: 22 April 2026</p>

        <p className="mt-4 max-w-none text-sm leading-7 text-black/85 sm:text-lg sm:leading-9">
          Welcome to Karim Real Estate. These Terms of Service govern your access to and
          use of our website, property listings, enquiry channels, and related services.
          By using our website, you agree to these terms. If you do not agree, please do
          not use the site.
        </p>

        <div className="mt-8 space-y-7 text-black/90 sm:mt-10 sm:space-y-8">
          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">1. Use of the Website</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              You may use this website only for lawful purposes related to property
              discovery, enquiries, and engagement with Karim Real Estate services. You
              agree not to misuse the site, interfere with its operation, or attempt
              unauthorized access to any part of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">2. Property Information</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We strive to keep property descriptions, prices, images, and availability
              accurate and up to date. However, listing details may change without notice
              and are subject to verification. Displayed information does not constitute a
              binding offer unless confirmed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">
              3. No Financial or Legal Advice
            </h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              Content on this website is provided for general information only and does
              not constitute legal, financial, tax, or investment advice. You should seek
              independent professional advice before making property or investment
              decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">4. User Enquiries and Communication</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              When you submit an enquiry, you agree to provide accurate and current
              information. You consent to Karim Real Estate contacting you through phone,
              email, or messaging channels in response to your request and to provide
              relevant service updates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">5. Intellectual Property</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              All content on this website, including branding, text, graphics, logos,
              photos, and layout, is owned by or licensed to Karim Real Estate unless
              stated otherwise. You may not copy, reproduce, republish, or distribute this
              content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">6. Third-Party Services and Links</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              Our website may contain links to third-party websites or tools. Karim Real
              Estate is not responsible for third-party content, terms, or privacy
              practices. Accessing third-party services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">7. Limitation of Liability</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              To the extent permitted by law, Karim Real Estate is not liable for indirect
              or consequential loss arising from use of this website, reliance on listing
              information, service interruptions, or third-party platform issues.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">8. Indemnity</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              You agree to indemnify and hold harmless Karim Real Estate and its team from
              claims, liabilities, and expenses resulting from your misuse of the website,
              violation of these terms, or infringement of any rights of another person or
              entity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">9. Changes to These Terms</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We may update these Terms of Service at any time to reflect service,
              operational, or legal changes. Updated terms will be posted on this page
              with the latest effective date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">10. Contact</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              For questions about these Terms of Service, please contact Karim Real Estate
              via our contact page or official communication channels.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
