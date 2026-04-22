import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Karim Real Estate website and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="min-h-screen bg-gradient-to-r from-brand via-[#1f6a4c] to-[#6ea77c] px-3 py-6 sm:px-6 sm:py-14 lg:px-10">
      <div className="w-full bg-white px-4 py-8 text-black sm:px-10 sm:py-12 lg:px-16 lg:py-14">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>

        <p className="mt-5 text-sm font-semibold sm:text-lg">Effective Date: 22 April 2026</p>

        <p className="mt-4 max-w-none text-sm leading-7 text-black/85 sm:text-lg sm:leading-9">
          At Karim Real Estate, we respect your privacy and are committed to protecting
          your personal information. This Privacy Policy explains how we collect, use,
          store, and protect your information when you use our website, request a
          consultation, enquire about property listings, or engage with our services.
        </p>

        <div className="mt-8 space-y-7 text-black/90 sm:mt-10 sm:space-y-8">
          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">1. Information We Collect</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We may collect personal information you provide directly to us, including:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 sm:pl-6 sm:text-lg sm:leading-9">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Property preferences and budget range</li>
              <li>Messages sent through contact forms or WhatsApp links</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">
              2. How We Use Your Information
            </h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We use your information to:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 sm:pl-6 sm:text-lg sm:leading-9">
              <li>Respond to your property enquiries and support requests</li>
              <li>Arrange viewings, consultations, and follow-up communication</li>
              <li>Share relevant listings based on your stated needs</li>
              <li>Improve our website content, user experience, and customer service</li>
              <li>Meet legal, compliance, and fraud-prevention obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">3. Cookies and Analytics</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              Our website may use cookies and similar technologies to understand traffic
              patterns, remember preferences, and improve your browsing experience. You
              can adjust your browser settings to refuse cookies, but some website
              features may not function fully.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">
              4. Sharing of Personal Information
            </h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              Karim Real Estate does not sell your personal information. We may only
              share information where necessary with trusted service providers (such as
              CRM, hosting, analytics, or communication tools), and only for business
              operations under confidentiality and data-protection obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">5. Data Security</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We implement reasonable administrative, technical, and organizational
              safeguards to protect personal information from loss, misuse, unauthorized
              access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">6. Data Retention</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We keep personal data only for as long as needed to fulfill the purposes
              outlined in this policy, or as required by applicable law and regulatory
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">7. Your Rights</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              Depending on your location, you may have rights to access, update, correct,
              or request deletion of your personal information. To make a request, please
              contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">8. Third-Party Links</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              Our website may include links to third-party platforms. We are not
              responsible for their privacy practices, and we recommend reviewing their
              policies before submitting personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">9. Updates to This Policy</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              We may update this Privacy Policy from time to time to reflect legal,
              operational, or service changes. The revised version will be posted on this
              page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-2xl">10. Contact Us</h2>
            <p className="mt-3 text-sm leading-7 sm:text-lg sm:leading-9">
              If you have questions about this Privacy Policy or how we handle personal
              data, please contact Karim Real Estate through our contact page or official
              support channels.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
