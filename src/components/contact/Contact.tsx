import { contact } from "@/lib/content";
import { ContactLink } from "./ContactLink";
import { KineticTitle } from "../motion/KineticTitle";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-[68rem] px-5 py-[clamp(4rem,10vw,7rem)] sm:px-8">
      <p className="eyebrow">Contact</p>
      <KineticTitle id="contact-title" text="Say hello." className="display mt-3 text-[clamp(2rem,1.5rem+2.6vw,3.5rem)]" />
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
