interface SectionLabelProps {
  /** 1-based position of the section on the page, rendered as "01". Pages without a sequence show "//". */
  index?: number;
  children: string;
  className?: string;
}

/** HUD-style section marker: "01 ── APPROACH". Decorative index, real text label. */
export function SectionLabel({ index, children, className = "" }: SectionLabelProps) {
  return (
    <div className={`text-hud flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className="text-primary">
        {index === undefined ? "//" : String(index).padStart(2, "0")}
      </span>
      <span aria-hidden="true" className="h-px w-8 bg-separator" />
      <span>{children}</span>
    </div>
  );
}
