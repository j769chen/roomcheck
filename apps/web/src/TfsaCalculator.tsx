import { calculateTfsa, formatCad, LATEST_TFSA_YEAR, parseAmount, TFSA_ANNUAL_LIMITS, TFSA_FIRST_YEAR, yearRange } from "@room/core";
import { useState } from "react";
import { MoneyField, Result, Row, YearField } from "./fields";

const currentYear = Math.min(new Date().getFullYear(), LATEST_TFSA_YEAR);

export function TfsaCalculator() {
  const [year, setYear] = useState(currentYear);
  const [birthYear, setBirthYear] = useState(1990);
  const [residentSince, setResidentSince] = useState(0);
  const [contributions, setContributions] = useState("");
  const [pastWithdrawals, setPastWithdrawals] = useState("");
  const [thisYearWithdrawals, setThisYearWithdrawals] = useState("");

  const r = calculateTfsa({
    year,
    birthYear,
    residentSinceYear: residentSince || undefined,
    totalContributions: parseAmount(contributions),
    withdrawalsBeforeThisYear: parseAmount(pastWithdrawals),
    withdrawalsThisYear: parseAmount(thisYearWithdrawals),
  });

  return (
    <div className="calculator">
      <form className="inputs" onSubmit={(e) => e.preventDefault()}>
        <YearField label="Tax year" value={year} years={yearRange(TFSA_FIRST_YEAR, LATEST_TFSA_YEAR)} onChange={setYear} />
        <YearField label="Year you were born" value={birthYear} years={yearRange(1920, currentYear).reverse()} onChange={setBirthYear} />
        <YearField
          label="Year you became a Canadian resident"
          hint="Leave as-is if you've lived in Canada since 2009 or since turning 18."
          value={residentSince}
          years={yearRange(TFSA_FIRST_YEAR, currentYear)}
          onChange={setResidentSince}
          allowEmpty="Always / before 2009"
        />
        <MoneyField
          label="Total contributed, all years"
          hint={`Every deposit you've made into any TFSA, up to today (including ${year}).`}
          value={contributions}
          onChange={setContributions}
        />
        <MoneyField
          label={`Total withdrawn before ${year}`}
          hint="Withdrawals are added back to your room on January 1 of the following year."
          value={pastWithdrawals}
          onChange={setPastWithdrawals}
        />
        <MoneyField label={`Withdrawn in ${year}`} hint="Comes back as room next year." value={thisYearWithdrawals} onChange={setThisYearWithdrawals} />
      </form>

      {r.overContribution > 0 ? (
        <Result headline="You're over-contributed by" amount={formatCad(r.overContribution)} tone="warn">
          <Row label="Penalty" value="1% of the excess per month until removed" />
        </Result>
      ) : (
        <Result headline={`TFSA room available in ${year}`} amount={formatCad(r.availableRoom)}>
          <Row label="Room accrued since" value={r.eligibleFromYear ? String(r.eligibleFromYear) : "Not eligible yet"} />
          <Row label="Total annual limits" value={formatCad(r.accruedLimits)} />
          <Row label={`${year} annual limit`} value={formatCad(TFSA_ANNUAL_LIMITS[year])} />
          {r.nextYearRoom !== null && <Row label={`Projected room on Jan 1, ${year + 1}`} value={formatCad(Math.max(0, r.nextYearRoom))} />}
        </Result>
      )}
    </div>
  );
}

