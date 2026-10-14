import { LATEST_TFSA_YEAR, TFSA_ANNUAL_LIMITS, TFSA_FIRST_YEAR, TFSA_MIN_AGE } from "./limits";

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
  availableRoom: number;
  overContribution: number;
  nextYearRoom: number | null;
  nextYearLimit: number | null;
}

export function tfsaEligibleFromYear(birthYear: number, residentSinceYear?: number): number {
  return Math.max(TFSA_FIRST_YEAR, birthYear + TFSA_MIN_AGE, residentSinceYear ?? TFSA_FIRST_YEAR);
}

export function calculateTfsa(input: TfsaInput): TfsaResult {
  if (input.year > LATEST_TFSA_YEAR) {
    throw new RangeError(`TFSA limits are only known through ${LATEST_TFSA_YEAR}`);
  }

  const start = tfsaEligibleFromYear(input.birthYear, input.residentSinceYear);
  let accruedLimits = 0;
  for (let y = start; y <= input.year; y++) accruedLimits += TFSA_ANNUAL_LIMITS[y];

  const room = accruedLimits + input.withdrawalsBeforeThisYear - input.totalContributions;
  const availableRoom = Math.max(0, room);
  const overContribution = Math.max(0, -room);

  const nextYearLimit = TFSA_ANNUAL_LIMITS[input.year + 1] ?? null;
  const nextYearEligible = start <= input.year + 1;
  const nextYearRoom =
    nextYearLimit === null ? null : room + input.withdrawalsThisYear + (nextYearEligible ? nextYearLimit : 0);

  return {
    eligibleFromYear: start <= input.year ? start : null,
    accruedLimits,
    availableRoom,
    overContribution,
    nextYearRoom,
    nextYearLimit,
  };
}
