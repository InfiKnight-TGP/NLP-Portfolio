import { fisher } from "@/lib/content";
import { SectionHeader } from "../SectionHeader";
import { DeviceMockup } from "./DeviceMockup";
import { RegexDemo } from "./RegexDemo";
import { FisherPinned } from "./FisherPinned";

const TONE: Record<string, string> = {
  high: "before:bg-[#e5484d]",
  review: "before:bg-[#f5b300]",
  none: "before:bg-[#9a9aa0]",
};

function Chapter({
  title,
  children,
  mockup,
  flip = false,
}: {
  title: string;
  children: React.ReactNode;
  mockup?: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
      <div className={flip ? "md:order-2" : undefined}>
        <h3 className="display text-[clamp(1.75rem,1.3rem+2vw,2.75rem)]">{title}</h3>
        <div className="mt-4 space-y-4 text-[1.0625rem] text-fg-2">{children}</div>
      </div>
      {mockup}
    </div>
  );
}

export function Fisher() {
  return (
    <section id="project" aria-labelledby="project-title" className="overflow-x-clip py-[clamp(5rem,12vw,9rem)]">
      <div className="mx-auto max-w-[68rem] px-5 sm:px-8">
        <SectionHeader id="project" eyebrow="Course Project" title="Fisher">
          <p className="lead mt-5 max-w-[40rem]">
            An offline scam-signal checker for English, Hindi, Tamil and Telugu, including Romanized
            (Hinglish, Tanglish) text.
          </p>
          <p className="mt-3 text-[0.9375rem] text-fg-3">{fisher.team}</p>
        </SectionHeader>
      </div>
      <FisherPinned />
      <div className="mx-auto max-w-[68rem] px-5 sm:px-8">
        <div className="mt-20 space-y-28 md:space-y-36">
          <Chapter
            title="Check the text where you read it."
            mockup={
              <DeviceMockup
                src="/fisher-context-menu.png"
                alt="A browser context menu over selected Hindi text, with the option “Check selection with Fisher”."
                width={910}
                height={1043}
              />
            }
          >
            <p>
              Fisher is a browser extension (Manifest V3) plus a command-line tool. Both share one
              rule-based engine.
            </p>
          </Chapter>

          <Chapter
            flip
            title="Four results, and none of them says “safe”."
            mockup={
              <DeviceMockup
                src="/fisher-result.png"
                alt="Fisher’s result panel reading “High-risk patterns found”, with what to do next and the evidence noticed."
                width={570}
                height={988}
                tilt={-1}
              />
            }
          >
            <ul className="space-y-2.5">
              {fisher.results.map((r) => (
                <li
                  key={r.label}
                  className={`flex items-center gap-3 font-medium text-fg before:h-2.5 before:w-2.5 before:shrink-0 before:rounded-full ${TONE[r.tone]}`}
                >
                  {r.label}
                </li>
              ))}
            </ul>
            <p>“No match” never means safe.</p>
          </Chapter>

          <Chapter
            title="Private by design."
            mockup={
              <DeviceMockup
                src="/fisher-bulk.png"
                alt="Fisher’s batch results reviewing four inputs: one high-risk, one review, one no match and one no result."
                width={656}
                height={929}
              />
            }
          >
            <p>
              No network, storage or telemetry. The extension asks for a single permission:{" "}
              <code className="rounded-md bg-[var(--hairline)] px-1.5 py-0.5 text-[0.9375rem] text-fg">
                contextMenus
              </code>
              .
            </p>
          </Chapter>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card spot p-7 sm:p-9">
              <h3 className="display text-[1.75rem]">Romanized text, several readings.</h3>
              <p className="mt-3 text-fg-2">
                A transliteration module returns several whole-word candidates for each Romanized
                word.
              </p>
            </div>
            <div className="card spot p-7 sm:p-9">
              <h3 className="display text-[1.75rem]">Measured per source.</h3>
              <p className="mt-3 text-fg-2">
                Evaluated per source group, with an error analysis and exact McNemar tests.
              </p>
            </div>
          </div>

          <aside
            aria-label="Limitation"
            className="rounded-[var(--radius-lg)] border-l-4 border-[#f5b300] bg-bg-2 p-7 sm:p-9"
          >
            <p className="eyebrow text-star-ink!">Honest limitation</p>
            <p className="mt-3 text-[1.1875rem] leading-normal text-fg">
              The central research question, whether several transliterations work better than one,
              is not yet answered: the evaluation data has almost no Indic scam messages.
            </p>
          </aside>

          <RegexDemo />

          <div className="max-w-[44rem]">
            <h3 className="display text-[clamp(1.75rem,1.3rem+2vw,2.75rem)]">What I learned</h3>
            <p className="mt-4 text-[1.0625rem] text-fg-2">{fisher.learned}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
