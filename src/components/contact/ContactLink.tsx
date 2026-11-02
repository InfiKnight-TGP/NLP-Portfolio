const ICONS: Record<string, string[]> = {
  GitHub: [
    "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  ],
  LinkedIn: ["M4 9h4v11H4z", "M6 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z", "M11 20V9h4v1.5c.8-1.2 2-1.8 3.5-1.8C20.6 8.7 21 10.2 21 12.5V20h-4v-6.5c0-1.2-.4-2-1.6-2s-1.9.9-1.9 2.1V20z"],
  Email: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
};

export function ContactLink({ label, handle, href }: { label: string; handle: string; href: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="card spot press flex items-center gap-4 p-5"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-accent" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[label].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-semibold text-fg-3">{label}</span>
        <span className="block truncate font-medium">{handle}</span>
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </a>
  );
}
