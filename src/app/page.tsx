import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { MotionPrefsProvider } from "@/lib/motionPrefs";
import { ScrollTint } from "@/components/motion/ScrollTint";
import { Spotlight } from "@/components/motion/Spotlight";
import { Marquee } from "@/components/motion/Marquee";
import { Stars } from "@/components/stars/Stars";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { Fisher } from "@/components/project/Fisher";
import { ClassInteraction, Closing, HandsOn } from "@/components/Sections";

const sections = [Stars, CaseStudy, Fisher, HandsOn, ClassInteraction, Marquee, Closing];

export default function Home() {
  return (
    <MotionPrefsProvider>
      <ScrollTint />
      <Spotlight />
      <Nav />
      <main>
        <Hero />
        {sections.map((S, i) => (
          <S key={i} />
        ))}
      </main>
    </MotionPrefsProvider>
  );
}
