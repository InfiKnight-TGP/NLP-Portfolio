import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { MotionProvider } from "@/components/MotionProvider";
import { Stars } from "@/components/stars/Stars";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { Fisher } from "@/components/project/Fisher";

export default function Home() {
  return (
    <MotionProvider>
      <Nav />
      <main>
        <Hero />
        <Stars />
        <CaseStudy />
        <Fisher />
      </main>
    </MotionProvider>
  );
}
