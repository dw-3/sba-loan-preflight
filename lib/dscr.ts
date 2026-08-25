export type DscrInputs = {
  annualNoi: number;
  existingAnnualDebtService: number;
  proposedLoanAmount: number;
  annualInterestRatePercent: number;
  termYears: number;
  comparisonThreshold: number;
};

export type DscrResult = {
  monthlyPayment: number;
  proposedAnnualPayment: number;
  totalAnnualDebtService: number;
  dscr: number;
  noiAtThreshold: number;
  cushionOrShortfall: number;
  relationship: "below" | "at" | "above";
};

const AT_THRESHOLD_EPSILON = 1e-10;

function assertFinite(name: string, value: number) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`);
  }
}

export function calculateDscr(inputs: DscrInputs): DscrResult {
  Object.entries(inputs).forEach(([name, value]) => assertFinite(name, value));

  if (inputs.annualNoi < 0 || inputs.existingAnnualDebtService < 0) {
    throw new RangeError("Cash flow and existing debt service cannot be negative.");
  }
  if (inputs.proposedLoanAmount <= 0) {
    throw new RangeError("Proposed loan amount must be greater than zero.");
  }
  if (inputs.annualInterestRatePercent < 0) {
    throw new RangeError("Annual interest rate cannot be negative.");
  }
  if (inputs.termYears <= 0 || inputs.comparisonThreshold <= 0) {
    throw new RangeError("Term and comparison threshold must be greater than zero.");
  }

  const numberOfPayments = inputs.termYears * 12;
  const monthlyRate = inputs.annualInterestRatePercent / 100 / 12;
  const monthlyPayment = monthlyRate === 0
    ? inputs.proposedLoanAmount / numberOfPayments
    : (inputs.proposedLoanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

  const proposedAnnualPayment = monthlyPayment * 12;
  const totalAnnualDebtService = inputs.existingAnnualDebtService + proposedAnnualPayment;
  const dscr = inputs.annualNoi / totalAnnualDebtService;
  const noiAtThreshold = inputs.comparisonThreshold * totalAnnualDebtService;
  const cushionOrShortfall = inputs.annualNoi - noiAtThreshold;
  const difference = dscr - inputs.comparisonThreshold;
  const relationship = Math.abs(difference) <= AT_THRESHOLD_EPSILON
    ? "at"
    : difference > 0 ? "above" : "below";

  return {
    monthlyPayment,
    proposedAnnualPayment,
    totalAnnualDebtService,
    dscr,
    noiAtThreshold,
    cushionOrShortfall,
    relationship,
  };
}
