import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const site = await getSettings();
  return (
    <div className="mx-auto max-w-[44rem] px-4 pt-14 sm:px-8">
      <p className="eyebrow">Last updated October 2026</p>
      <h1 className="mt-4 text-6xl">Privacy Policy</h1>
      <div className="prose-elonai no-dropcap mt-10">
        <p>Elonai Store (“we”) respects your privacy. This page explains what we collect and how we use it.</p>
        <h2>What we collect</h2>
        <p>When you download a book, join a waitlist or subscribe, we collect your first name, email address and, if you choose to share them, your state, a prayer request and your answers to a few short optional questions (how you found us, what’s on your heart, your age range). These answers help us decide which devotionals to write next.</p>
        <p>We also count visits to understand which pages help people most: the page visited, the website that sent you (for example Facebook or Google), your approximate location (country, state and city, provided by our hosting) your device type, and how long you spent reading a page and how far you scrolled. We do not use advertising cookies and we do not store your IP address; visits are counted with a code that changes every day, so you can&rsquo;t be followed from one day to the next.</p>
        <h2>How we use it</h2>
        <ul>
          <li>To send you the book and, if you opted in, daily reminders and our weekly email.</li>
          <li>To pray for the requests you share. We only mention a request in our community, using your first name only, if you gave permission.</li>
          <li>To understand which resources are most helpful.</li>
        </ul>
        <p><strong>We never sell or rent your information.</strong> Your data is stored with trusted service providers (such as our database and email providers) only to deliver these services.</p>
        <h2>Your choices</h2>
        <p>You can unsubscribe from any email with one click, or ask us to delete your information at any time by writing to <a href={`mailto:${site.contact_email}`}>{site.contact_email}</a>.</p>
        <h2>Children</h2>
        <p>Our site is intended for adults. We do not knowingly collect information from children under 13.</p>
      </div>
    </div>
  );
}
