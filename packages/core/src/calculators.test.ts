import { describe, expect, it } from "vitest";
import {
  calculateFhsa,
  calculateRrsp,
  calculateTfsa,
  parseAmount,
  RRSP_DOLLAR_LIMITS,
  rrspDollarLimit,
  TFSA_ANNUAL_LIMITS,
  TFSA_INDEXATION_RATES,
  tfsaLimit,
} from "./index";

describe("tfsaLimit", () => {
  it("reproduces every published indexed limit from the indexation rates", () => {
    let indexed = 5000;
    for (const year of Object.keys(TFSA_INDEXATION_RATES).map(Number)) {
      indexed *= 1 + TFSA_INDEXATION_RATES[year];
      if (year !== 2015) expect(Math.round(indexed / 500) * 500).toBe(TFSA_ANNUAL_LIMITS[year]);
    }
  });

  it("returns published limits as exact", () => {
    expect(tfsaLimit(2026)).toEqual({ amount: 7000, estimated: false });
  });

  it("projects later years in $500 steps", () => {
    const limit = tfsaLimit(2040);
    expect(limit.estimated).toBe(true);
    expect(limit.amount % 500).toBe(0);
    expect(limit.amount).toBeGreaterThan(7000);
  });
});

describe("rrspDollarLimit", () => {
  it("returns published limits as exact", () => {
    expect(rrspDollarLimit(2027)).toEqual({ amount: 35390, estimated: false });
  });

  it("projects later years from the latest published limit", () => {
    const limit = rrspDollarLimit(2028);
    expect(limit.estimated).toBe(true);
    expect(limit.amount).toBeGreaterThan(RRSP_DOLLAR_LIMITS[2027]);
    expect(limit.amount % 10).toBe(0);
  });

  it("rejects years before the table starts", () => {
    expect(() => rrspDollarLimit(2000)).toThrow(RangeError);
  });
});

describe("calculateTfsa", () => {
  const base = { year: 2026, totalContributions: 0, withdrawalsBeforeThisYear: 0, withdrawalsThisYear: 0 };

  it("gives the full cumulative room to someone eligible since 2009", () => {
    const r = calculateTfsa({ ...base, birthYear: 1980 });
    expect(r.eligibleFromYear).toBe(2009);
    expect(r.availableRoom).toBe(109000);
  });

  it("starts accruing in the year the holder turns 18", () => {
    const r = calculateTfsa({ ...base, birthYear: 2006 });
    expect(r.eligibleFromYear).toBe(2024);
    expect(r.availableRoom).toBe(21000);
  });

  it("starts accruing in the year the holder became a resident", () => {
    const r = calculateTfsa({ ...base, birthYear: 1990, residentSinceYear: 2022 });
    expect(r.availableRoom).toBe(6000 + 6500 + 7000 + 7000 + 7000);
  });

  it("adds back prior-year withdrawals but not this year's", () => {
    const r = calculateTfsa({
      ...base,
      birthYear: 1980,
      totalContributions: 100000,
      withdrawalsBeforeThisYear: 5000,
      withdrawalsThisYear: 3000,
    });
    expect(r.availableRoom).toBe(14000);
    expect(r.nextYearLimit.estimated).toBe(true);
    expect(r.nextYearRoom).toBe(14000 + 3000 + r.nextYearLimit.amount);
  });

  it("projects next year's room when the next limit is known", () => {
    const r = calculateTfsa({ ...base, year: 2025, birthYear: 1980, totalContributions: 100000, withdrawalsThisYear: 3000 });
    expect(r.availableRoom).toBe(2000);
    expect(r.nextYearRoom).toBe(2000 + 3000 + 7000);
  });

  it("works for years past the published limits", () => {
    const r = calculateTfsa({ ...base, year: 2035, birthYear: 1980 });
    expect(r.usesEstimates).toBe(true);
    expect(r.availableRoom).toBeGreaterThan(109000 + 9 * 7000);
  });

  it("reports over-contributions", () => {
    const r = calculateTfsa({ ...base, birthYear: 2006, totalContributions: 25000 });
    expect(r.availableRoom).toBe(0);
    expect(r.overContribution).toBe(4000);
  });

  it("gives no room before the holder turns 18", () => {
    const r = calculateTfsa({ ...base, birthYear: 2010 });
    expect(r.eligibleFromYear).toBeNull();
    expect(r.availableRoom).toBe(0);
  });
});

describe("calculateRrsp", () => {
  const base = {
    year: 2026,
    unusedRoomFromLastYear: 0,
    pensionAdjustment: 0,
    pastServicePensionAdjustment: 0,
    pensionAdjustmentReversal: 0,
    contributions: 0,
  };

  it("uses 18% of last year's earned income", () => {
    const r = calculateRrsp({ ...base, lastYearEarnedIncome: 100000 });
    expect(r.newRoom).toBe(18000);
    expect(r.availableRoom).toBe(18000);
  });

  it("caps new room at the annual dollar limit", () => {
    const r = calculateRrsp({ ...base, lastYearEarnedIncome: 250000 });
    expect(r.incomeBasedRoom).toBe(33810);
    expect(r.dollarLimit.estimated).toBe(false);
  });

  it("applies pension adjustments and carried-forward room", () => {
    const r = calculateRrsp({
      ...base,
      unusedRoomFromLastYear: 12000,
      lastYearEarnedIncome: 100000,
      pensionAdjustment: 5000,
      pensionAdjustmentReversal: 1000,
      contributions: 20000,
    });
    expect(r.deductionLimit).toBe(26000);
    expect(r.availableRoom).toBe(6000);
  });

  it("only penalizes excess beyond the $2,000 buffer", () => {
    const r = calculateRrsp({ ...base, lastYearEarnedIncome: 50000, contributions: 12500 });
    expect(r.overContribution).toBe(3500);
    expect(r.penalizedExcess).toBe(1500);
  });

  it("caps at a projected limit for years past the published ones", () => {
    const r = calculateRrsp({ ...base, year: 2035, lastYearEarnedIncome: 1_000_000 });
    expect(r.dollarLimit.estimated).toBe(true);
    expect(r.incomeBasedRoom).toBe(r.dollarLimit.amount);
  });
});

describe("calculateFhsa", () => {
  it("gives $8,000 in the year the account opens", () => {
    const r = calculateFhsa({ year: 2026, openedYear: 2026, contributionsByYear: {} });
    expect(r.availableRoom).toBe(8000);
    expect(r.nextYearRoom).toBe(16000);
  });

  it("carries forward at most $8,000 of unused room", () => {
    const r = calculateFhsa({ year: 2026, openedYear: 2023, contributionsByYear: {} });
    expect(r.years.map((y) => y.participationRoom)).toEqual([8000, 16000, 16000, 16000]);
    expect(r.availableRoom).toBe(16000);
  });

  it("carries forward only what was left over", () => {
    const r = calculateFhsa({ year: 2025, openedYear: 2023, contributionsByYear: { 2023: 3000, 2024: 13000 } });
    expect(r.years.map((y) => y.participationRoom)).toEqual([8000, 13000, 8000]);
    expect(r.availableRoom).toBe(8000);
  });

  it("stops at the $40,000 lifetime limit", () => {
    const r = calculateFhsa({
      year: 2027,
      openedYear: 2023,
      contributionsByYear: { 2023: 8000, 2024: 8000, 2025: 8000, 2026: 8000 },
    });
    expect(r.availableRoom).toBe(8000);
    expect(r.lifetimeRemaining).toBe(8000);
    expect(r.nextYearRoom).toBe(8000);
  });

  it("reports over-contributions", () => {
    const r = calculateFhsa({ year: 2024, openedYear: 2024, contributionsByYear: { 2024: 9000 } });
    expect(r.overContribution).toBe(1000);
  });

  it("carries an over-contribution forward against later years' room", () => {
    const r = calculateFhsa({ year: 2026, openedYear: 2023, contributionsByYear: { 2023: 8000, 2024: 20000 } });
    expect(r.years.map((y) => y.participationRoom)).toEqual([8000, 8000, -4000, 4000]);
    expect(r.availableRoom).toBe(4000);
    expect(r.overContribution).toBe(0);
  });

  it("works for any later year", () => {
    const r = calculateFhsa({ year: 2040, openedYear: 2030, contributionsByYear: { 2030: 8000, 2031: 8000 } });
    expect(r.availableRoom).toBe(16000);
    expect(r.lastParticipationYear).toBe(2044);
  });

  it("rejects accounts opened before 2023", () => {
    expect(() => calculateFhsa({ year: 2026, openedYear: 2022, contributionsByYear: {} })).toThrow(RangeError);
  });
});

describe("parseAmount", () => {
  it("strips currency formatting", () => {
    expect(parseAmount("$12,500")).toBe(12500);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("abc")).toBe(0);
  });
});
