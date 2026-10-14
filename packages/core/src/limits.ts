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

export const RRSP_INCOME_RATE = 0.18;
export const RRSP_OVERCONTRIBUTION_BUFFER = 2000;

export const FHSA_FIRST_YEAR = 2023;
export const FHSA_ANNUAL_LIMIT = 8000;
export const FHSA_LIFETIME_LIMIT = 40000;
export const FHSA_CARRYFORWARD_CAP = 8000;
export const FHSA_MAX_PARTICIPATION_YEARS = 15;

export const TFSA_FIRST_YEAR = 2009;
export const TFSA_MIN_AGE = 18;

const lastKey = (table: Readonly<Record<number, number>>) => Math.max(...Object.keys(table).map(Number));

export const LATEST_TFSA_YEAR = lastKey(TFSA_ANNUAL_LIMITS);
export const LATEST_RRSP_YEAR = lastKey(RRSP_DOLLAR_LIMITS);
