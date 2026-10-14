import { calculateFhsa, FHSA_FIRST_YEAR, FHSA_LIFETIME_LIMIT, formatCad, parseAmount, yearRange } from "@room/core";
import { useState } from "react";
import { MoneyField, Result, Row, YearField } from "./fields";

const currentYear = Math.max(new Date().getFullYear(), FHSA_FIRST_YEAR);

export function FhsaCalculator() {
  const [year, setYear] = useState(currentYear);
  const [openedYear, setOpenedYear] = useState(FHSA_FIRST_YEAR);
  const [contributions, setContributions] = useState<Record<number, string>>({});

  const effectiveOpened = Math.min(openedYear, year);
  const accountYears = yearRange(effectiveOpened, year);
  const contributionsByYear = Object.fromEntries(accountYears.map((y) => [y, parseAmount(contributions[y] ?? "")]));
  const r = calculateFhsa({ year, openedYear: effectiveOpened, contributionsByYear });

  return (
    <div className="calculator">
      <form className="inputs" onSubmit={(e) => e.preventDefault()}>
        <YearField label="Tax year" value={year} years={yearRange(FHSA_FIRST_YEAR, currentYear)} onChange={setYear} />
        <YearField
          label="Year you opened your first FHSA"
          hint="Room only starts building once an account is open."
          value={effectiveOpened}
          years={yearRange(FHSA_FIRST_YEAR, year)}
          onChange={setOpenedYear}
        />
        {accountYears.map((y) => (
          <MoneyField
            key={y}
            label={`Contributed in ${y}`}
            hint={y === effectiveOpened ? "Include transfers from an RRSP. Withdrawals don't give room back." : undefined}
            value={contributions[y] ?? ""}
            onChange={(v) => setContributions((c) => ({ ...c, [y]: v }))}
          />
        ))}
      </form>

      {r.overContribution > 0 ? (
        <Result headline="You're over-contributed by" amount={formatCad(r.overContribution)} tone="warn">
          <Row label="Penalty" value="1% of the excess per month until removed" />
        </Result>
      ) : (
        <Result headline={`FHSA room available in ${year}`} amount={formatCad(r.availableRoom)}>
          {r.years.map((y) => (
            <Row key={y.year} label={`${y.year} room (incl. ${formatCad(y.carryForwardIn)} carried in)`} value={formatCad(y.participationRoom)} />
          ))}
          <Row label="Lifetime contributed" value={`${formatCad(r.lifetimeContributed)} of ${formatCad(FHSA_LIFETIME_LIMIT)}`} />
          <Row label={`Projected room in ${year + 1}`} value={formatCad(r.nextYearRoom)} />
          <Row label="Account must close by" value={`End of ${r.lastParticipationYear} (or the year you turn 71)`} />
        </Result>
      )}
    </div>
  );
}
