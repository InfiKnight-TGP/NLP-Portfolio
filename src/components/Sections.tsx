import { fisher, handsOn, interaction, person } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { Pipeline } from "./hands-on/Pipeline";
import { FlipCards } from "./interaction/FlipCards";

export function HandsOn() {
  return (
    <section id="hands-on" aria-labelledby="hands-on-title" className="bg-bg-2 py-[clamp(5rem,12vw,9rem)]">
      <div className="mx-auto grid max-w-[68rem] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHeader id="hands-on" eyebrow="Hands-On Session" title="NLTK, step by step.">
            <p className="lead mt-5">{handsOn}</p>
          </SectionHeader>
        </div>
        <Pipeline />
      </div>
    </section>
  );
}

export function ClassInteraction() {
  return (
    <section id="class" aria-labelledby="class-title" className="py-[clamp(5rem,12vw,9rem)]">
      <div className="mx-auto max-w-[68rem] px-5 sm:px-8">
        <SectionHeader id="class" eyebrow="Class Interaction" title="Speaking up in class.">
          <p className="lead mt-5 max-w-[36rem]">{interaction.intro}</p>
        </SectionHeader>
        <div className="mt-12">
          <FlipCards />
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <>
      <section aria-label="What I learned" className="bg-bg-2 py-[clamp(5rem,14vw,10rem)]">
        <p className="display mx-auto max-w-[56rem] px-5 text-center text-[clamp(1.75rem,1.2rem+2.6vw,3.25rem)] sm:px-8">
          {fisher.honesty}
        </p>
      </section>
      <footer className="mx-auto max-w-[68rem] px-5 py-10 text-[0.875rem] text-fg-3 sm:px-8">
        <p>
          {person.name} · {person.courseCode} {person.courseTitle} · {person.university} ·{" "}
          {person.semester}
        </p>
        <p className="mt-1">Guided by {person.guide}.</p>
      </footer>
    </>
  );
}
