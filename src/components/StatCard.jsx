const ACCENT_BORDER = {
  ink: "border-l-ink",
  "ledger-green": "border-l-ledger-green",
  "stamp-red": "border-l-stamp-red",
  brass: "border-l-brass",
};

/**
 * StatCard — styled like a register summary line: a card with a thick
 * left rule (like a ledger column divider) rather than a generic
 * rounded card with a soft shadow.
 *
 * @param {{ label: string, value: string, sublabel?: string, accent?: "ink"|"ledger-green"|"stamp-red"|"brass" }} props
 */
export function StatCard({ label, value, sublabel, accent = "ink" }) {
  return (
    <div
      className={`relative bg-paper border border-border-paper ${ACCENT_BORDER[accent]} border-l-[3px] rounded-[var(--radius-card)] px-5 py-4`}
    >
      <p className="font-body text-xs uppercase tracking-wider text-ink/50">
        {label}
      </p>
      <p className="font-mono text-3xl font-medium text-ink mt-1.5">
        {value}
      </p>
      {sublabel && (
        <p className="font-body text-xs text-ink/45 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
