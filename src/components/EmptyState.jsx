/**
 * EmptyState — an invitation to act, not an apology. Written in the
 * interface's voice per the design system: explain what's missing
 * and what to do about it, plainly.
 */
export function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-border-paper rounded-[var(--radius-card)] px-8 py-12 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <p className="font-body text-sm text-ink/50 mt-1.5 max-w-sm mx-auto">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
