import { stars } from "@/lib/content";
import { CountUp } from "./CountUp";
import { StarField } from "./StarField";
import { ZoomCard } from "./ZoomCard";

export function Stars() {
  return (
    <section id="stars" aria-labelledby="stars-title" className="mx-auto max-w-[68rem] px-5 py-[clamp(5rem,12vw,9rem)] sm:px-8">
      <p className="eyebrow">Stars</p>
      <h2 id="stars-title" className="display mt-3 text-[clamp(3rem,2rem+6vw,6rem)]">
        <CountUp to={stars.total} /> stars
      </h2>
      <p className="lead mt-5 max-w-[34rem]">{stars.intro}</p>

      <div className="mt-10">
        <StarField />
      </div>

      <div className="mt-20 grid items-center gap-10 md:grid-cols-[1fr_22rem]">
        <div>
          <h3 className="display text-[clamp(1.75rem,1.4rem+1.6vw,2.5rem)]">Where they were signed</h3>
          <p className="lead mt-4 max-w-[30rem]">{stars.photoAlt}</p>
        </div>
        <ZoomCard />
      </div>
    </section>
  );
}
