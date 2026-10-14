import { calculateTfsa, currentYear, formatCad, formatLimit, LATEST_TFSA_YEAR, parseAmount, TFSA_FIRST_YEAR, TFSA_PROJECTION_NOTE } from "@room/core";
import { useState } from "react";
import { Card, MoneyField, Result, Row, YearField } from "./ui";

const thisYear = currentYear();
const lastYear = Math.max(thisYear, LATEST_TFSA_YEAR);

export function Tfsa() {
  const [year, setYear] = useState(thisYear);
  const [birthYear, setBirthYear] = useState(1990);
  const [residentSince, setResidentSince] = useState(TFSA_FIRST_YEAR - 1);
  const [contributions, setContributions] = useState("");
  const [pastWithdrawals, setPastWithdrawals] = useState("");
  const [thisYearWithdrawals, setThisYearWithdrawals] = useState("");

  const r = calculateTfsa({
    year,
    birthYear,
    residentSinceYear: residentSince >= TFSA_FIRST_YEAR ? residentSince : undefined,
    totalContributions: parseAmount(contributions),
    withdrawalsBeforeThisYear: parseAmount(pastWithdrawals),
    withdrawalsThisYear: parseAmount(thisYearWithdrawals),
  });

  return (
    <>
      {r.overContribution > 0 ? (
        <Result headline="You're over-contributed by" amount={formatCad(r.overContribution)} tone="warn">
          <Row label="Penalty" value="1% of the excess per month" />
        </Result>
      ) : (
        <Result headline={`TFSA room available in ${year}`} amount={formatCad(r.availableRoom)}
          note={r.usesEstimates || r.nextYearLimit.estimated ? TFSA_PROJECTION_NOTE : undefined}
        >
          <Row label="Room accrued since" value={r.eligibleFromYear ? String(r.eligibleFromYear) : "Not eligible yet"} />
          <Row label="Total annual limits" value={formatCad(r.accruedLimits)} />
          <Row label={`${year} annual limit`} value={formatLimit(r.yearLimit)} />
          <Row label={`Projected room on Jan 1, ${year + 1}`} value={formatCad(r.nextYearRoom) + (r.nextYearLimit.estimated ? " (est.)" : "")} />
        </Result>
      )}
      <Card>
        <YearField label="Tax year" value={year} min={TFSA_FIRST_YEAR} max={lastYear} onChange={setYear} />
        <YearField label="Year you were born" value={birthYear} min={1920} max={thisYear} onChange={setBirthYear} />
        <YearField
          label="Year you became a Canadian resident"
          hint="Leave as-is if you've lived in Canada since 2009 or since turning 18."
          value={residentSince}
          min={TFSA_FIRST_YEAR}
          max={thisYear}
          onChange={setResidentSince}
          emptyLabel="Always / before 2009"
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
      </Card>
    </>
  );
}
