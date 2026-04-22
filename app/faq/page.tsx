import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently Asked Questions for Karim Real Estate.",
};

const FAQ_HERO_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=80";

const leftFaqs = [
  {
    question: "What services does Karim Real Estate offer in property management?",
    answer:
      "We provide comprehensive property support, including tenant coordination, rent collection guidance, maintenance follow-up, and owner reporting.",
  },
  {
    question: "What is a real estate portfolio, and how do you help manage it?",
    answer:
      "A real estate portfolio is a collection of properties owned for living or investment. We help clients structure, monitor, and optimize their portfolio performance over time.",
  },
  {
    question: "Do you help landlords find verified tenants?",
  },
  {
    question: "How do you determine the right rental price for my property?",
    answer:
      "We use current market comparisons, location demand, property condition, and target tenant profiles to recommend a competitive and sustainable rental range.",
  },
  {
    question: "Can Karim Real Estate assist with property maintenance coordination?",
  },
  {
    question: "Do you provide regular updates and reports to property owners?",
  },
];

const rightFaqs = [
  {
    question: "Can you help with investing in Kenyan and international real estate?",
    answer:
      "Yes. We support clients with local and international opportunities, combining market insight, due diligence guidance, and tailored recommendations.",
  },
  {
    question: "What type of properties do you manage and market?",
    answer:
      "We handle residential homes, apartments, serviced units, land parcels, and selected commercial properties depending on client goals and location strategy.",
  },
  {
    question: "Do you support first-time buyers through the full process?",
  },
  {
    question: "How do I book a viewing for a listed property?",
    answer:
      "You can request a viewing through our contact page or phone line, and our team will confirm available slots and share all required details.",
  },
  {
    question: "Can I list my property with Karim Real Estate?",
  },
  {
    question: "What documents are usually needed before closing a transaction?",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-cream">
      <section className="relative isolate min-h-[250px] overflow-hidden sm:min-h-[360px]">
        <Image
          src={FAQ_HERO_IMAGE}
          alt="Modern apartment buildings"
          fill
          priority
          className="scale-105 object-cover blur-[1.5px]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand/85 via-[#1f6a4c]/80 to-[#2b7a56]/75 backdrop-blur-[1px]" />

        <div className="relative z-10 flex min-h-[250px] items-center justify-center px-4 text-center sm:min-h-[360px] sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
        </div>
      </section>

      <section className="bg-[#efefef] px-3 py-10 sm:px-6 sm:py-16 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
              FAQs Real Estate Portfolio
            </h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-brand" />
            <p className="mx-auto mt-4 max-w-3xl text-base text-black/70 sm:mt-5 sm:text-lg">
              Find answers to common questions about our services, policies, and more.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2">
            <div className="space-y-0 shadow-sm">
              {leftFaqs.map((item, index) => (
                <article key={item.question}>
                  <h3 className="bg-[#f5ab45] px-4 py-4 text-lg font-semibold leading-tight text-[#0f172a] sm:px-8 sm:py-6 sm:text-2xl">
                    {item.question}
                  </h3>
                  {item.answer && (
                    <div className="bg-white px-4 py-5 sm:px-8 sm:py-7">
                      <p className="text-base leading-7 text-black/80 sm:text-lg sm:leading-9">{item.answer}</p>
                    </div>
                  )}
                  {index < leftFaqs.length - 1 && <div className="h-[1px] bg-transparent" />}
                </article>
              ))}
            </div>

            <div className="space-y-0 shadow-sm">
              {rightFaqs.map((item, index) => (
                <article key={item.question}>
                  <h3 className="bg-brand px-4 py-4 text-lg font-semibold leading-tight text-white sm:px-8 sm:py-6 sm:text-2xl">
                    {item.question}
                  </h3>
                  {item.answer && (
                    <div className="bg-white px-4 py-5 sm:px-8 sm:py-7">
                      <p className="text-base leading-7 text-black/80 sm:text-lg sm:leading-9">{item.answer}</p>
                    </div>
                  )}
                  {index < rightFaqs.length - 1 && <div className="h-[1px] bg-transparent" />}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
