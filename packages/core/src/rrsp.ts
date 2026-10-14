import { RRSP_INCOME_RATE, RRSP_OVERCONTRIBUTION_BUFFER, rrspDollarLimit, type Limit } from "./limits";

export interface RrspInput {
  year: number;
  unusedRoomFromLastYear: number;
  lastYearEarnedIncome: number;
  pensionAdjustment: number;
  pastServicePensionAdjustment: number;
  pensionAdjustmentReversal: number;
  contributions: number;
}

export interface RrspResult {
  dollarLimit: Limit;
  incomeBasedRoom: number;
  newRoom: number;
  deductionLimit: number;
  availableRoom: number;
  overContribution: number;
  penalizedExcess: number;
}

export function calculateRrsp(input: RrspInput): RrspResult {
  const dollarLimit = rrspDollarLimit(input.year);
  const incomeBasedRoom = Math.min(Math.round(input.lastYearEarnedIncome * RRSP_INCOME_RATE), dollarLimit.amount);
  const newRoom =
    incomeBasedRoom - input.pensionAdjustment - input.pastServicePensionAdjustment + input.pensionAdjustmentReversal;
  const deductionLimit = input.unusedRoomFromLastYear + newRoom;
  const remaining = deductionLimit - input.contributions;
  const overContribution = Math.max(0, -remaining);

  return {
    dollarLimit,
    incomeBasedRoom,
    newRoom,
    deductionLimit,
    availableRoom: Math.max(0, remaining),
    overContribution,
    penalizedExcess: Math.max(0, overContribution - RRSP_OVERCONTRIBUTION_BUFFER),
  };
}
