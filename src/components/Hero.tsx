import { person } from "@/lib/content";
import { Portrait } from "./Portrait";
import { HeroStage } from "./hero/HeroStage";

const i = (n: number) => ({ "--i": n }) as React.CSSProperties;

export function Hero() {
  const words = person.name.split(" ");
  return (
    <HeroStage>
      <div id="hero-text">
        <p className="eyebrow rise" style={i(0)}>
          {person.university} · {person.courseCode} course portfolio
        </p>
        {/* The name assembles from dots (HeroIntro); the text itself fades in as they land. */}
        <h1 id="hero-title" className="display mt-4 text-[clamp(3.25rem,2rem+7vw,6.5rem)]">
          {words.map((w, n) => (
            <span key={w} data-word={w}>
              <span className="intro-word inline-block" style={i(n)}>
                {w}
              </span>
              {n < words.length - 1 && " "}
            </span>
          ))}
        </h1>
        <p className="lead rise mt-6 max-w-[30rem]" style={i(1)}>
          What I learned in {person.courseTitle}, {person.semester}.
        </p>
        <ul aria-label="Course details" className="rise mt-8 flex flex-wrap gap-2" style={i(2)}>
          <li className="chip">
            <span className="text-fg-3">Course</span> {person.courseCode} · {person.courseTitle}
          </li>
          <li className="chip">
            <span className="text-fg-3">Slot</span> {person.slot}
          </li>
          <li className="chip">
            <span className="text-fg-3">Guide</span> {person.guide}
          </li>
        </ul>
      </div>
      <Portrait />
    </HeroStage>
  );
}
