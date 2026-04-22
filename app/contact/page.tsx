import { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Contact",
  description: "Speak with our advisors for private viewings and investment guidance.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="mb-10 space-y-3">
        <p className="text-sm uppercase tracking-[0.25em] text-brand">Contact</p>
        <h1 className="text-4xl font-semibold">Schedule a Private Consultation</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4 rounded-sm border border-zinc-200 bg-white p-6">
          <Input id="name" label="Full Name" placeholder="Jane Doe" required />
          <Input id="email" label="Email Address" placeholder="jane@email.com" required type="email" />
          <Input id="phone" label="Phone Number" placeholder="+254 700 000 000" />
          <label className="grid gap-2 text-sm text-zinc-700" htmlFor="message">
            <span className="font-medium">Message</span>
            <textarea
              id="message"
              rows={6}
              className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-brand"
              placeholder="Tell us what you are looking for..."
            />
          </label>
          <Button className="w-full" type="submit">
            Send Inquiry
          </Button>
        </form>
        <div className="space-y-5 rounded-sm border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-semibold">Our Office</h2>
          <p className="text-sm leading-7 text-zinc-700">
            4th Floor, Riverside Square
            <br />
            Riverside Drive, Nairobi
            <br />
            Mon - Fri, 8:00 AM - 6:00 PM
          </p>
          <div className="h-72 rounded-sm border border-zinc-200 bg-zinc-100 p-4 text-sm text-zinc-500">
            Map placeholder for future integration
          </div>
        </div>
      </div>
    </section>
  );
}
