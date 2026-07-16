"use client";

/**
 * Frosted-glass "Próximamente" overlay. Sits on top of a section (or the whole
 * page) so the design behind stays visible but nothing underneath is clickable.
 *
 * Positioning is driven by `className`:
 *   - "absolute inset-0"            → cover a `relative` section (e.g. the map)
 *   - "fixed inset-x-0 top-20 bottom-0" → cover a full page below the fixed nav
 *
 * z-40 keeps it below the nav (z-50) so users can still navigate away.
 */
export default function ComingSoon({
  title = "Próximamente",
  subtitle,
  className = "absolute inset-0",
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={`${title}. Sección en construcción.`}
      className={`${className} z-40 flex items-center justify-center px-6 bg-primary/25 backdrop-blur-md cursor-not-allowed select-none`}
    >
      <div className="flex flex-col items-center gap-4 text-center rounded-3xl bg-light/70 px-8 py-7 shadow-xl ring-1 ring-white/40 backdrop-blur-sm">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-2.5 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-alte-bold uppercase tracking-[0.22em] text-light text-sm md:text-base">
            {title}
          </span>
        </span>
        {subtitle && (
          <p className="max-w-sm font-alte-bold text-primary/80 text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
