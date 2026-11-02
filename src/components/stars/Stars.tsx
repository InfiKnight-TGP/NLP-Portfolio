import { stars } from "@/lib/content";
import { StarField } from "./StarField";
import { StarsPinned } from "./StarsPinned";
import { ZoomCard } from "./ZoomCard";

export function Stars() {
  return (
    <section id="stars" aria-labelledby="stars-title">
      <StarsPinned />
      <div className="mx-auto max-w-[68rem] px-5 pt-16 pb-[clamp(5rem,12vw,9rem)] sm:px-8">
        <h3 className="display text-[clamp(1.75rem,1.4rem+1.6vw,2.5rem)]">Explore the sky</h3>
        <p className="lead mt-3 max-w-[34rem]">Each star is one of the notable moments. Open one to read it.</p>
        <div className="mt-8">
          <StarField />
        </div>

        <div className="mt-20 grid items-center gap-10 md:grid-cols-[1fr_22rem]">
          <div>
            <h3 className="display text-[clamp(1.75rem,1.4rem+1.6vw,2.5rem)]">Where they were signed</h3>
            <p className="lead mt-4 max-w-[30rem]">{stars.photoAlt}</p>
          </div>
          <ZoomCard />
        </div>
      </div>
    </section>
  );
}
