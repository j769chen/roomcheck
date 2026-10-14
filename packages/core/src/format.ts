const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export const formatCad = (amount: number) => cad.format(amount);

export function parseAmount(text: string): number {
  const n = Number(text.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
