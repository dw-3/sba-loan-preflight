import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateDscr } from "../lib/dscr.ts";

const base = {
  annualNoi: 180_000,
  existingAnnualDebtService: 0,
  proposedLoanAmount: 1_000_000,
  annualInterestRatePercent: 7.5,
  termYears: 25,
  comparisonThreshold: 1.25,
};

describe("calculateDscr", () => {
  it("calculates the public example with full precision", () => {
    const result = calculateDscr(base);
    assert.ok(Math.abs(result.monthlyPayment - 7_389.91) < 0.01);
    assert.ok(Math.abs(result.proposedAnnualPayment - 88_678.94) < 0.01);
    assert.ok(Math.abs(result.dscr - 2.02979) < 0.00001);
    assert.equal(result.relationship, "above");
  });

  it("adds existing annual debt service", () => {
    const result = calculateDscr({ ...base, existingAnnualDebtService: 30_000 });
    assert.ok(Math.abs(result.totalAnnualDebtService - 118_678.94) < 0.01);
    assert.ok(Math.abs(result.dscr - 1.51670) < 0.00001);
  });

  it("handles a zero-interest exact-threshold loan", () => {
    const result = calculateDscr({
      ...base,
      proposedLoanAmount: 120_000,
      annualInterestRatePercent: 0,
      termYears: 10,
      annualNoi: 15_000,
    });
    assert.equal(result.monthlyPayment, 1_000);
    assert.equal(result.proposedAnnualPayment, 12_000);
    assert.equal(result.dscr, 1.25);
    assert.equal(result.relationship, "at");
  });

  it("classifies values immediately above and below the threshold", () => {
    const scenario = {
      ...base,
      proposedLoanAmount: 120_000,
      annualInterestRatePercent: 0,
      termYears: 10,
    };
    assert.equal(calculateDscr({ ...scenario, annualNoi: 15_000.01 }).relationship, "above");
    assert.equal(calculateDscr({ ...scenario, annualNoi: 14_999.99 }).relationship, "below");
  });

  it("rejects invalid domain values", () => {
    assert.throws(() => calculateDscr({ ...base, proposedLoanAmount: 0 }), /greater than zero/);
    assert.throws(() => calculateDscr({ ...base, termYears: 0 }), /greater than zero/);
    assert.throws(() => calculateDscr({ ...base, annualInterestRatePercent: -1 }), /cannot be negative/);
    assert.throws(() => calculateDscr({ ...base, annualNoi: Number.NaN }), /finite/);
  });
});
