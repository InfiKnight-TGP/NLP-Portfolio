import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { MotionProvider } from "@/components/MotionProvider";
import { Stars } from "@/components/stars/Stars";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { Fisher } from "@/components/project/Fisher";
import { ClassInteraction, Closing, HandsOn } from "@/components/Sections";

export default function Home() {
  return (
    <MotionProvider>
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
    </MotionProvider>
  );
}
