import { person } from "@/lib/content";
import { Portrait } from "./Portrait";

export function Hero() {
  const words = person.name.split(" ");
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-[68rem] items-center gap-12 px-5 pt-12 pb-20 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-28"
    >
      <div>
        <p className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties}>
          {person.university} · {person.courseCode} course portfolio
        </p>
        <h1
          id="hero-title"
          className="display mt-4 text-[clamp(3.25rem,2rem+7vw,6.5rem)]"
        >
          {words.map((w, i) => (
            <span key={w}>
              <span className="rise inline-block" style={{ "--i": i + 1 } as React.CSSProperties}>
                {w}
              </span>
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h1>
        <p
          className="lead rise mt-6 max-w-[30rem]"
          style={{ "--i": words.length + 1 } as React.CSSProperties}
        >
          What I learned in {person.courseTitle}, {person.semester}.
        </p>
        <ul
          aria-label="Course details"
          className="rise mt-8 flex flex-wrap gap-2"
          style={{ "--i": words.length + 2 } as React.CSSProperties}
        >
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
    </section>
  );
}
