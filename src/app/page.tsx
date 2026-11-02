import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { MotionProvider } from "@/components/MotionProvider";

export default function Home() {
  return (
    <MotionProvider>
      <Nav />
      <main>
        <Hero />
      </main>
    </MotionProvider>
  );
}
