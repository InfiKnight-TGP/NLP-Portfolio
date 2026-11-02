import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { MotionProvider } from "@/components/MotionProvider";
import { Stars } from "@/components/stars/Stars";

export default function Home() {
  return (
    <MotionProvider>
      <Nav />
      <main>
        <Hero />
        <Stars />
      </main>
    </MotionProvider>
  );
}
