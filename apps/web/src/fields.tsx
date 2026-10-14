import type { ReactNode } from "react";

interface MoneyFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

export function MoneyField({ label, hint, value, onChange }: MoneyFieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="money">
        <span aria-hidden>$</span>
        <input inputMode="decimal" placeholder="0" value={value} onChange={(e) => onChange(e.target.value)} />
      </span>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

interface YearFieldProps {
  label: string;
  hint?: string;
  value: number;
  years: number[];
  onChange: (value: number) => void;
  allowEmpty?: string;
}

export function YearField({ label, hint, value, years, onChange, allowEmpty }: YearFieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {allowEmpty && <option value={0}>{allowEmpty}</option>}
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

interface ResultProps {
  headline: string;
  amount: string;
  tone?: "ok" | "warn";
  children?: ReactNode;
}

export function Result({ headline, amount, tone = "ok", children }: ResultProps) {
  return (
    <section className={`result ${tone}`} aria-live="polite">
      <span className="result-label">{headline}</span>
      <span className="result-amount">{amount}</span>
      {children && <dl className="breakdown">{children}</dl>}
    </section>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
