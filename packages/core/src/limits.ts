export const TFSA_ANNUAL_LIMITS: Readonly<Record<number, number>> = {
  2009: 5000,
  2010: 5000,
  2011: 5000,
  2012: 5000,
  2013: 5500,
  2014: 5500,
  2015: 10000,
  2016: 5500,
  2017: 5500,
  2018: 5500,
  2019: 6000,
  2020: 6000,
  2021: 6000,
  2022: 6000,
  2023: 6500,
  2024: 7000,
  2025: 7000,
  2026: 7000,
};

export const TFSA_INDEXATION_RATES: Readonly<Record<number, number>> = {
  2010: 0.006,
  2011: 0.014,
  2012: 0.028,
  2013: 0.02,
  2014: 0.009,
  2015: 0.017,
  2016: 0.013,
  2017: 0.014,
  2018: 0.015,
  2019: 0.022,
  2020: 0.019,
  2021: 0.01,
  2022: 0.024,
  2023: 0.063,
  2024: 0.047,
  2025: 0.027,
  2026: 0.02,
};

export const RRSP_DOLLAR_LIMITS: Readonly<Record<number, number>> = {
  2018: 26230,
  2019: 26500,
  2020: 27230,
  2021: 27830,
  2022: 29210,
  2023: 30780,
  2024: 31560,
  2025: 32490,
  2026: 33810,
  2027: 35390,
};

export const ASSUMED_INFLATION = 0.02;
export const ASSUMED_WAGE_GROWTH = 0.03;

export const RRSP_INCOME_RATE = 0.18;
export const RRSP_OVERCONTRIBUTION_BUFFER = 2000;

export const FHSA_FIRST_YEAR = 2023;
export const FHSA_ANNUAL_LIMIT = 8000;
export const FHSA_LIFETIME_LIMIT = 40000;
export const FHSA_CARRYFORWARD_CAP = 8000;
export const FHSA_MAX_PARTICIPATION_YEARS = 15;

export const TFSA_FIRST_YEAR = 2009;
export const TFSA_MIN_AGE = 18;
const TFSA_BASE_LIMIT = 5000;

const years = (table: Readonly<Record<number, number>>) => Object.keys(table).map(Number);

export const LATEST_TFSA_YEAR = Math.max(...years(TFSA_ANNUAL_LIMITS));
export const LATEST_RRSP_YEAR = Math.max(...years(RRSP_DOLLAR_LIMITS));
export const FIRST_RRSP_YEAR = Math.min(...years(RRSP_DOLLAR_LIMITS));

export interface Limit {
  amount: number;
  estimated: boolean;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

const tfsaIndexedAmount = years(TFSA_INDEXATION_RATES).reduce(
  (amount, year) => amount * (1 + TFSA_INDEXATION_RATES[year]),
  TFSA_BASE_LIMIT,
);
const lastIndexedTfsaYear = Math.max(...years(TFSA_INDEXATION_RATES));

export function tfsaLimit(year: number): Limit {
  if (year < TFSA_FIRST_YEAR) return { amount: 0, estimated: false };
  const known = TFSA_ANNUAL_LIMITS[year];
  if (known !== undefined) return { amount: known, estimated: false };
  const projected = tfsaIndexedAmount * (1 + ASSUMED_INFLATION) ** (year - lastIndexedTfsaYear);
  return { amount: roundTo(projected, 500), estimated: true };
}

export function rrspDollarLimit(year: number): Limit {
  const known = RRSP_DOLLAR_LIMITS[year];
  if (known !== undefined) return { amount: known, estimated: false };
  if (year < FIRST_RRSP_YEAR) {
    throw new RangeError(`No RRSP dollar limit on file before ${FIRST_RRSP_YEAR}`);
  }
  const projected = RRSP_DOLLAR_LIMITS[LATEST_RRSP_YEAR] * (1 + ASSUMED_WAGE_GROWTH) ** (year - LATEST_RRSP_YEAR);
  return { amount: roundTo(projected, 10), estimated: true };
}
