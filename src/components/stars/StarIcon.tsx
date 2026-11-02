export function StarIcon({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
      <path
        fill="currentColor"
        d="M12 1.8l2.95 6.3 6.9.85-5.08 4.75 1.33 6.82L12 17.15l-6.1 3.37 1.33-6.82L2.15 8.95l6.9-.85z"
      />
    </svg>
  );
}

export function StarCount({ count, className = "h-4 w-4" }: { count: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-star" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <StarIcon key={i} className={className} />
      ))}
    </span>
  );
}
