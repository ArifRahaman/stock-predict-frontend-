export const pct = (v: number | undefined | null, digits = 2) =>
  v === undefined || v === null || Number.isNaN(v)
    ? "—"
    : `${(v * 100).toFixed(digits)}%`;

export const signedPct = (v: number | undefined | null, digits = 2) =>
  v === undefined || v === null || Number.isNaN(v)
    ? "—"
    : `${v >= 0 ? "+" : ""}${(v * 100).toFixed(digits)}%`;

export const num = (v: number | undefined | null, digits = 2) =>
  v === undefined || v === null || Number.isNaN(v)
    ? "—"
    : v.toLocaleString(undefined, { maximumFractionDigits: digits });

export const upColor = (v: number | undefined) =>
  v === undefined ? "var(--muted)" : v >= 0 ? "var(--up)" : "var(--down)";
