const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    ring: "border-ledger-green",
    fill: "bg-ledger-green/10",
    text: "text-ledger-green",
  },
  partial: {
    label: "Partial",
    ring: "border-brass",
    fill: "bg-brass/10",
    text: "text-brass",
  },
  pending: {
    label: "Pending",
    ring: "border-border-paper",
    fill: "bg-ink/5",
    text: "text-ink/60",
  },
  overdue: {
    label: "Overdue",
    ring: "border-stamp-red",
    fill: "bg-stamp-red/10",
    text: "text-stamp-red",
  },
};

/**
 * FeeSeal — the signature visual element of Eduvia.
 * Styled like a wax stamp / ink seal on a paper ledger entry,
 * rather than a generic colored pill. Rotated slightly off-axis
 * to read as "stamped", not "generated".
 *
 * @param {{ status: "paid" | "partial" | "pending" | "overdue" }} props
 */
export function FeeSeal({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] ${config.ring} ${config.fill} px-2.5 py-0.5 -rotate-2 select-none`}
      role="status"
      aria-label={`Fee status: ${config.label}`}
    >
      <span
        className={`font-display text-[11px] font-semibold uppercase tracking-wide ${config.text}`}
      >
        {config.label}
      </span>
    </span>
  );
}
