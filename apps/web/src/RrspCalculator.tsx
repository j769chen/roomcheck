import {
  calculateRrsp,
  currentYear,
  FIRST_RRSP_YEAR,
  formatCad,
  formatLimit,
  LATEST_RRSP_YEAR,
  parseAmount,
  RRSP_PROJECTION_NOTE,
  yearRange,
} from "@room/core";
import { useState } from "react";
import { MoneyField, Result, Row, YearField } from "./fields";

const thisYear = currentYear();
const years = yearRange(FIRST_RRSP_YEAR, Math.max(thisYear + 1, LATEST_RRSP_YEAR));
const defaultYear = Math.max(thisYear, FIRST_RRSP_YEAR);

export function RrspCalculator() {
  const [year, setYear] = useState(defaultYear);
  const [unused, setUnused] = useState("");
  const [income, setIncome] = useState("");
  const [pa, setPa] = useState("");
  const [pspa, setPspa] = useState("");
  const [par, setPar] = useState("");
  const [contributions, setContributions] = useState("");

  const r = calculateRrsp({
    year,
    unusedRoomFromLastYear: parseAmount(unused),
    lastYearEarnedIncome: parseAmount(income),
    pensionAdjustment: parseAmount(pa),
    pastServicePensionAdjustment: parseAmount(pspa),
    pensionAdjustmentReversal: parseAmount(par),
    contributions: parseAmount(contributions),
  });

  return (
    <div className="calculator">
      <form className="inputs" onSubmit={(e) => e.preventDefault()}>
        <YearField label="Tax year" value={year} years={years} onChange={setYear} />
        <MoneyField
          label={`Unused RRSP room at the end of ${year - 1}`}
          hint="Shown on your Notice of Assessment as unused RRSP contributions / deduction room carried forward."
          value={unused}
          onChange={setUnused}
        />
        <MoneyField
          label={`${year - 1} earned income`}
          hint="Employment and self-employment income, net rental income, taxable support received, etc."
          value={income}
          onChange={setIncome}
        />
        <MoneyField label={`${year - 1} pension adjustment (PA)`} hint="Box 52 on your T4. Leave blank if you have no workplace pension." value={pa} onChange={setPa} />
        <MoneyField label="Past service pension adjustment (PSPA)" hint="Rare. From a T215 if your employer sent one." value={pspa} onChange={setPspa} />
        <MoneyField label="Pension adjustment reversal (PAR)" hint="From a T10 if you left a pension plan early." value={par} onChange={setPar} />
        <MoneyField
          label={`Contributions for ${year}`}
          hint={`Contributions made from March ${year} to the deadline in early ${year + 1}, plus any undeducted earlier ones.`}
          value={contributions}
          onChange={setContributions}
        />
      </form>

      {r.overContribution > 0 ? (
        <Result headline="You're over your deduction limit by" amount={formatCad(r.overContribution)} tone="warn">
          <Row label="Penalty-free buffer" value={formatCad(2000)} />
          <Row label="Taxed at 1% per month" value={formatCad(r.penalizedExcess)} />
        </Result>
      ) : (
        <Result headline={`RRSP room available for ${year}`}
          amount={formatCad(r.availableRoom)}
          note={r.dollarLimit.estimated ? RRSP_PROJECTION_NOTE : undefined}
        >
          <Row label={`${year} dollar limit`} value={formatLimit(r.dollarLimit)} />
          <Row label={`18% of ${year - 1} income (capped)`} value={formatCad(r.incomeBasedRoom)} />
          <Row label={`New room for ${year}`} value={formatCad(r.newRoom)} />
          <Row label={`${year} deduction limit`} value={formatCad(r.deductionLimit)} />
        </Result>
      )}
    </div>
  );
}
