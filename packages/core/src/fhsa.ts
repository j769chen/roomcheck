import {
  FHSA_ANNUAL_LIMIT,
  FHSA_CARRYFORWARD_CAP,
  FHSA_FIRST_YEAR,
  FHSA_LIFETIME_LIMIT,
  FHSA_MAX_PARTICIPATION_YEARS,
} from "./limits";

export interface FhsaInput {
  year: number;
  openedYear: number;
  contributionsByYear: Readonly<Record<number, number>>;
}

export interface FhsaYear {
  year: number;
  carryForwardIn: number;
  participationRoom: number;
  contributed: number;
  unusedRoom: number;
}

export interface FhsaResult {
  years: FhsaYear[];
  availableRoom: number;
  overContribution: number;
  lifetimeContributed: number;
  lifetimeRemaining: number;
  nextYearRoom: number;
  lastParticipationYear: number;
}

export function calculateFhsa(input: FhsaInput): FhsaResult {
  if (input.openedYear < FHSA_FIRST_YEAR) {
    throw new RangeError(`FHSAs did not exist before ${FHSA_FIRST_YEAR}`);
  }
  if (input.openedYear > input.year) {
    throw new RangeError("The account must be opened on or before the selected year");
  }

  const lastParticipationYear = input.openedYear + FHSA_MAX_PARTICIPATION_YEARS - 1;
  const years: FhsaYear[] = [];
  let carryForward = 0;
  let lifetimeContributed = 0;

  for (let y = input.openedYear; y <= input.year; y++) {
    const contributed = input.contributionsByYear[y] ?? 0;
    const participationRoom = Math.min(FHSA_ANNUAL_LIMIT + carryForward, FHSA_LIFETIME_LIMIT - lifetimeContributed);
    const unusedRoom = participationRoom - contributed;
    years.push({ year: y, carryForwardIn: carryForward, participationRoom, contributed, unusedRoom });
    carryForward = Math.min(FHSA_CARRYFORWARD_CAP, unusedRoom);
    lifetimeContributed += contributed;
  }

  const current = years[years.length - 1];
  const lifetimeRemaining = Math.max(0, FHSA_LIFETIME_LIMIT - lifetimeContributed);
  const nextYearRoom =
    input.year + 1 > lastParticipationYear ? 0 : Math.max(0, Math.min(FHSA_ANNUAL_LIMIT + carryForward, lifetimeRemaining));

  return {
    years,
    availableRoom: Math.max(0, current.unusedRoom),
    overContribution: Math.max(0, -current.unusedRoom),
    lifetimeContributed,
    lifetimeRemaining,
    nextYearRoom,
    lastParticipationYear,
  };
}
