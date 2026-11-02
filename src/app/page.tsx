import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { MotionPrefsProvider } from "@/lib/motionPrefs";
import { ScrollTint } from "@/components/motion/ScrollTint";
import { Stars } from "@/components/stars/Stars";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { Fisher } from "@/components/project/Fisher";
import { ClassInteraction, Closing, HandsOn } from "@/components/Sections";

export default function Home() {
  return (
    <MotionPrefsProvider>
      <ScrollTint />
      <Nav />
      <main>
        <Hero />
        <Stars />
        <CaseStudy />
        <Fisher />
        <HandsOn />
        <ClassInteraction />
        <Closing />
      </main>
    </MotionPrefsProvider>
  );
}
