import { caseStudy } from "@/lib/content";
import { SectionHeader } from "../SectionHeader";
import { Carousel } from "./Carousel";
import { CasePinned } from "./CasePinned";
import { VectorPlayground } from "./VectorPlayground";

export function CaseStudy() {
  return (
    <section
      id="case-study"
      aria-labelledby="case-study-title"
      className="overflow-x-clip py-[clamp(5rem,12vw,9rem)]"
    >
      <div className="mx-auto max-w-[68rem] px-5 sm:px-8">
        <SectionHeader id="case-study" eyebrow="Case Study" title="Turning text into vectors.">
          {caseStudy.body.map((p) => (
            <p key={p.slice(0, 20)} className="lead mt-5 max-w-[40rem]">
              {p}
            </p>
          ))}
        </SectionHeader>
      </div>
      <CasePinned />
      <div className="mx-auto max-w-[68rem] px-5 sm:px-8">
        <div className="mt-12">
          <Carousel />
        </div>
        <div className="mt-24">
          <VectorPlayground />
        </div>
      </div>
    </section>
  );
}
