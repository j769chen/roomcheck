import { ASSUMED_INFLATION, ASSUMED_WAGE_GROWTH, LATEST_RRSP_YEAR, LATEST_TFSA_YEAR, type Limit } from "./limits";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

export const formatCad = (amount: number) => cad.format(amount);

export const formatLimit = (limit: Limit) => formatCad(limit.amount) + (limit.estimated ? " (est.)" : "");

export function parseAmount(text: string): number {
  const n = Number(text.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export const TFSA_PROJECTION_NOTE = `Limits after ${LATEST_TFSA_YEAR} are estimates assuming ${ASSUMED_INFLATION * 100}% inflation. CRA announces each year's limit in November.`;

export const RRSP_PROJECTION_NOTE = `Limits after ${LATEST_RRSP_YEAR} are estimates assuming ${ASSUMED_WAGE_GROWTH * 100}% wage growth. CRA announces each year's limit in November.`;
