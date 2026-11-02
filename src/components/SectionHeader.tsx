export function SectionHeader({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`} className="display mt-3 max-w-[48rem] text-[clamp(2.25rem,1.6rem+3.6vw,4.5rem)]">
        {title}
      </h2>
      {children}
    </header>
  );
}
