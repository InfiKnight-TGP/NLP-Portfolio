import { KineticTitle } from "./motion/KineticTitle";

export function SectionHeader({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <KineticTitle id={`${id}-title`} text={title} className="display mt-3 max-w-[48rem] text-[clamp(2.25rem,1.6rem+3.6vw,4.5rem)]" />
      {children}
    </header>
  );
}
