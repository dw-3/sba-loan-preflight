"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { calculateDscr, type DscrInputs, type DscrResult } from "../lib/dscr";

type FieldName = keyof DscrInputs;
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const EMPTY_VALUES: FormValues = {
  annualNoi: "",
  existingAnnualDebtService: "",
  proposedLoanAmount: "",
  annualInterestRatePercent: "",
  termYears: "",
  comparisonThreshold: "",
};

const EXAMPLE_VALUES: FormValues = {
  annualNoi: "180,000",
  existingAnnualDebtService: "0",
  proposedLoanAmount: "1,000,000",
  annualInterestRatePercent: "7.5",
  termYears: "25",
  comparisonThreshold: "1.25",
};

const MAX_MONEY = 1_000_000_000_000;

const fieldDefinitions: Array<{
  name: FieldName;
  label: string;
  hint: string;
  kind: "currency" | "percent" | "years" | "ratio";
}> = [
  { name: "annualNoi", label: "Annual net operating income", hint: "Income after operating expenses, before debt service.", kind: "currency" },
  { name: "existingAnnualDebtService", label: "Existing annual debt service", hint: "Annual principal and interest for business debt already in place.", kind: "currency" },
  { name: "proposedLoanAmount", label: "Proposed loan amount", hint: "The principal you want to model—not a program limit.", kind: "currency" },
  { name: "annualInterestRatePercent", label: "Annual interest rate", hint: "Use a current quote or a scenario rate. Rates change.", kind: "percent" },
  { name: "termYears", label: "Term", hint: "Enter the modeled repayment period in years.", kind: "years" },
  { name: "comparisonThreshold", label: "Comparison threshold", hint: "Use a lender-provided number or load the labeled example.", kind: "ratio" },
];

function parseNumericInput(raw: string): number | null {
  const normalized = raw.trim().replace(/[$,\s]/g, "");
  if (!normalized || !/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function validate(values: FormValues): { errors: FormErrors; parsed?: DscrInputs } {
  const errors: FormErrors = {};
  const parsed = {} as DscrInputs;

  for (const field of fieldDefinitions) {
    const value = parseNumericInput(values[field.name]);
    if (value === null) {
      errors[field.name] = "Enter a number using digits, commas, or a decimal point.";
      continue;
    }
    if (value < 0) {
      errors[field.name] = "Enter zero or a positive number.";
      continue;
    }
    if (["proposedLoanAmount", "termYears", "comparisonThreshold"].includes(field.name) && value === 0) {
      errors[field.name] = "Enter a number greater than zero.";
      continue;
    }
    if (field.kind === "currency" && value > MAX_MONEY) {
      errors[field.name] = "Enter an amount below $1 trillion.";
      continue;
    }
    if (field.kind === "percent" && value > 100) {
      errors[field.name] = "Enter a rate of 100% or less.";
      continue;
    }
    if (field.kind === "years" && value > 100) {
      errors[field.name] = "Enter a term of 100 years or less.";
      continue;
    }
    if (field.kind === "ratio" && value > 10) {
      errors[field.name] = "Enter a comparison ratio of 10.00 or less.";
      continue;
    }
    parsed[field.name] = value;
  }

  return Object.keys(errors).length ? { errors } : { errors, parsed };
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function resultHeading(result: DscrResult) {
  if (result.relationship === "at") return "At the selected threshold";
  return result.relationship === "above" ? "Above the selected threshold" : "Below the selected threshold";
}

export default function Home() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const validation = useMemo(() => validate(values), [values]);
  const result = submitted && validation.parsed ? calculateDscr(validation.parsed) : null;

  function runPreflight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validation.errors).length) {
      const firstError = fieldDefinitions.find((field) => validation.errors[field.name]);
      window.setTimeout(() => document.getElementById(firstError?.name ?? "")?.focus(), 0);
      return;
    }
    window.setTimeout(() => resultRef.current?.focus(), 0);
  }

  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="https://www.diliawood.com/">Dilia Wood</a>
        <span>Borrower Intelligence</span>
      </header>

      <div className="page-shell">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">SBA loan preparation · repayment preflight</p>
            <h1 id="page-title">See the repayment relationship before you apply.</h1>
            <p className="lede">Model your own ability to repay using transparent arithmetic. See what changes the relationship—before a lender evaluates the wider file.</p>
          </div>
          <div className="privacy-stamp" aria-label="Privacy summary">
            <span>Private by design</span>
            <strong>Runs in this browser</strong>
            <small>No account · Nothing stored · No inputs transmitted</small>
          </div>
        </section>

        <section className="tool-grid" aria-label="Repayment preflight calculator">
          <form className="input-card" onSubmit={runPreflight} noValidate>
            <SectionHeading step="01" title="Enter the business numbers" subtitle="Use a lender quote when you have one, or model a scenario." />

            <div className="form-grid">
              {fieldDefinitions.map((field) => {
                const error = submitted ? validation.errors[field.name] : undefined;
                const prefix = field.kind === "currency" ? "$" : undefined;
                const suffix = field.kind === "percent" ? "%" : field.kind === "years" ? "years" : field.kind === "ratio" ? "×" : undefined;
                return (
                  <div className="field" key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <div className={`input-wrap${error ? " has-error" : ""}`}>
                      {prefix && <span aria-hidden="true">{prefix}</span>}
                      <input
                        id={field.name}
                        name={field.name}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={values[field.name]}
                        onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                        aria-invalid={Boolean(error)}
                        aria-describedby={`${field.name}-hint${error ? ` ${field.name}-error` : ""}`}
                      />
                      {suffix && <span aria-hidden="true">{suffix}</span>}
                    </div>
                    <p className="field-hint" id={`${field.name}-hint`}>{field.hint}</p>
                    {error && <p className="field-error" id={`${field.name}-error`} role="alert">{error}</p>}
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit">Run repayment preflight</button>
              <button className="text-button" type="button" onClick={() => { setValues(EXAMPLE_VALUES); setSubmitted(false); }}>Load example</button>
              <button className="text-button" type="button" onClick={() => { setValues(EMPTY_VALUES); setSubmitted(false); }}>Clear</button>
            </div>
            <p className="example-note">The example uses $180,000 NOI, a $1,000,000 loan at 7.5% for 25 years, and a 1.25 comparison threshold. It is illustrative, not a current quote or universal lender standard.</p>
          </form>

          <section className={`result-card${result ? " has-result" : ""}`} aria-labelledby="result-title" aria-live="polite" aria-atomic="true" tabIndex={-1} ref={resultRef}>
            <SectionHeading step="02" title="Read the relationship" subtitle="Arithmetic first. Interpretation second." result id="result-title" />
            {!result ? (
              <div className="empty-result">
                <span className="empty-ratio" aria-hidden="true">—.—</span>
                <p>Enter your numbers and run the preflight. Your result will appear here without sending the inputs anywhere.</p>
              </div>
            ) : (
              <ResultPanel result={result} threshold={validation.parsed!.comparisonThreshold} />
            )}
          </section>
        </section>

        <section className="explain-grid" aria-label="Methodology and boundaries">
          <Explain title="One relationship, made visible." label="What this shows">The tool estimates principal and interest for the proposed loan, adds existing annual business debt service, and divides the NOI you entered by that total.</Explain>
          <Explain title="Not eligibility. Not approval." label="What it does not decide">Lenders may adjust cash flow and debt differently. They also examine credit, collateral, equity, global cash flow, policy, and the complete transaction.</Explain>
          <Explain title="A comparison, not a promise." label="Your threshold">Enter a number supplied by your lender when possible. A loaded example is labeled as such and is not presented as an SBA rule.</Explain>
        </section>

        <details className="methodology">
          <summary>Methodology, rounding, and source boundary</summary>
          <div className="methodology-body">
            <p>The proposed payment uses the standard fixed-payment amortization formula with monthly payments. A zero-rate scenario divides principal evenly across the number of months. The result then annualizes twelve monthly payments.</p>
            <p>Calculations use unrounded values. Currency is displayed to the nearest dollar and DSCR to two decimal places, so a displayed boundary may conceal a small underlying difference.</p>
            <p>SBA states that most 7(a) term loans use monthly principal-and-interest payments and that repayment terms vary. This tool does not embed an SBA approval threshold. Source last reviewed August 25, 2026: <a href="https://www.sba.gov/loans/7a-loans/">SBA 7(a) loans</a>.</p>
          </div>
        </details>

        <section className="boundary-note" aria-labelledby="boundary-title">
          <p className="eyebrow">Professional boundary</p>
          <h2 id="boundary-title">Preparation, not transaction-specific advice.</h2>
          <p>Estimates are for educational preparation. This application is not a lender, broker, packager, CDC, CPA, attorney, eligibility tool, underwriting system, quote, commitment, or lending decision. Confirm the inputs and method that apply to your transaction with the appropriate professionals.</p>
        </section>

        <footer>
          <p>Developed from Dilia Wood’s public borrower education and rebuilt as a documented software proof of work in collaboration with AI coding agents.</p>
          <a href="https://www.diliawood.com/sba-loan-what-to-do-before-you-apply/">Read the originating public article</a>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({ step, title, subtitle, result = false, id }: { step: string; title: string; subtitle: string; result?: boolean; id?: string }) {
  return <div className={`section-heading${result ? " result-heading" : ""}`}><span className="step">{step}</span><div><h2 id={id}>{title}</h2><p>{subtitle}</p></div></div>;
}

function Explain({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return <article><p className="eyebrow">{label}</p><h2>{title}</h2><p>{children}</p></article>;
}

function ResultPanel({ result, threshold }: { result: DscrResult; threshold: number }) {
  const difference = Math.abs(result.cushionOrShortfall);
  return (
    <div className="result-content">
      <div className={`relationship relationship-${result.relationship}`}>
        <p>{resultHeading(result)}</p>
        <strong>{result.dscr.toFixed(2)}</strong>
        <span>Debt service coverage ratio</span>
      </div>
      <dl className="result-list">
        <ResultRow label="Proposed annual principal & interest" value={money.format(result.proposedAnnualPayment)} />
        <ResultRow label="Total modeled annual debt service" value={money.format(result.totalAnnualDebtService)} />
        <ResultRow label={`NOI associated with ${threshold.toFixed(2)}×`} value={money.format(result.noiAtThreshold)} />
        <ResultRow emphasis label={result.relationship === "below" ? "Modeled NOI shortfall" : result.relationship === "at" ? "Difference at full precision" : "Modeled NOI cushion"} value={money.format(difference)} />
      </dl>
      <div className="interpretation">
        <strong>Your selected comparison is {threshold.toFixed(2)}×.</strong>
        <p>This result describes only the cash flow and debt service entered here. A lender may use different definitions, adjustments, periods, and thresholds when evaluating the complete file.</p>
      </div>
    </div>
  );
}

function ResultRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={emphasis ? "result-emphasis" : undefined}><dt>{label}</dt><dd>{value}</dd></div>;
}
