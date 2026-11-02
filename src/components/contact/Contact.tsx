import { contact } from "@/lib/content";
import { ContactLink } from "./ContactLink";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-[68rem] px-5 py-[clamp(4rem,10vw,7rem)] sm:px-8">
      <p className="eyebrow">Contact</p>
      <h2 id="contact-title" className="display mt-3 text-[clamp(2rem,1.5rem+2.6vw,3.5rem)]">
        Say hello.
      </h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {contact.map((c) => (
          <li key={c.label}>
            <ContactLink {...c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
