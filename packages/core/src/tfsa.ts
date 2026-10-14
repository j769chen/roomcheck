import { TFSA_FIRST_YEAR, TFSA_MIN_AGE, tfsaLimit, type Limit } from "./limits";

export interface TfsaInput {
  year: number;
  birthYear: number;
  residentSinceYear?: number;
  totalContributions: number;
  withdrawalsBeforeThisYear: number;
  withdrawalsThisYear: number;
}

export interface TfsaResult {
  eligibleFromYear: number | null;
  accruedLimits: number;
  yearLimit: Limit;
  usesEstimates: boolean;
  availableRoom: number;
  overContribution: number;
  nextYearRoom: number;
  nextYearLimit: Limit;
}

export function tfsaEligibleFromYear(birthYear: number, residentSinceYear?: number): number {
  return Math.max(TFSA_FIRST_YEAR, birthYear + TFSA_MIN_AGE, residentSinceYear ?? TFSA_FIRST_YEAR);
}

export function calculateTfsa(input: TfsaInput): TfsaResult {
  const start = tfsaEligibleFromYear(input.birthYear, input.residentSinceYear);
  let accruedLimits = 0;
  let usesEstimates = false;
  for (let y = start; y <= input.year; y++) {
    const limit = tfsaLimit(y);
    accruedLimits += limit.amount;
    usesEstimates ||= limit.estimated;
  }

  const room = accruedLimits + input.withdrawalsBeforeThisYear - input.totalContributions;
  const nextYearLimit = tfsaLimit(input.year + 1);
  const nextYearAccrual = start <= input.year + 1 ? nextYearLimit.amount : 0;

  return {
    eligibleFromYear: start <= input.year ? start : null,
    accruedLimits,
    yearLimit: tfsaLimit(input.year),
    usesEstimates,
    availableRoom: Math.max(0, room),
    overContribution: Math.max(0, -room),
    nextYearRoom: Math.max(0, room + input.withdrawalsThisYear + nextYearAccrual),
    nextYearLimit,
  };
}
