# Accuracy and methodology

**Release:** 1.0.0  
**Last reviewed:** August 25, 2026

## Calculation contract

The engine in `lib/dscr.ts` is a pure function. It accepts six finite numeric inputs:

| Input | Domain |
|---|---|
| Annual net operating income | Zero or greater |
| Existing annual debt service | Zero or greater |
| Proposed principal | Greater than zero |
| Annual nominal interest rate | Zero or greater |
| Term in years | Greater than zero |
| Comparison threshold | Greater than zero |

For proposed principal `P`, annual nominal rate `i`, and term `y`:

```text
r = (i / 100) / 12
n = y × 12
monthly payment = P × r / (1 - (1 + r)^-n), when r > 0
monthly payment = P / n, when r = 0
proposed annual payment = monthly payment × 12
total annual debt service = existing annual debt service + proposed annual payment
DSCR = annual NOI / total annual debt service
NOI at threshold = comparison threshold × total annual debt service
cushion or shortfall = annual NOI - NOI at threshold
```

## Precision and interpretation

Calculations and the above/at/below classification use unrounded JavaScript numbers. Currency is displayed to the nearest dollar and DSCR to two decimal places. A displayed boundary can therefore look exact even when a small full-precision difference exists.

The `at` state uses a narrow `1e-10` ratio epsilon to absorb floating-point representation at a mathematically exact boundary. The threshold is always entered by the user or loaded through a clearly labeled example; it is not encoded as an SBA rule.

## Verification evidence

The automated suite covers:

- the public example scenario;
- existing annual debt service;
- zero-interest amortization;
- an exact threshold;
- values immediately above and below the threshold;
- zero principal and term;
- a negative rate;
- non-finite input;
- a production build and rendered public shell.

Release checks:

```text
npm test      PASS — 5 calculation tests, production build, rendered-output test
npm run lint  PASS — zero errors
```

## Source and policy boundary

SBA states that most 7(a) term loans use monthly principal-and-interest payments and that repayment terms vary. Primary source: [SBA 7(a) loans](https://www.sba.gov/loans/7a-loans/).

The application does not claim to reproduce a lender's cash-flow adjustments, global cash-flow analysis, credit review, collateral analysis, eligibility work, equity requirements, policy exceptions, or approval process. It embeds no lender or SBA approval threshold.

## Privacy verification

The form is client-side state. The calculation module has no network or persistence capability. The release includes no analytics, ads, session replay, account flow, cookies, local storage, session storage, IndexedDB, upload, or query-string serialization of user inputs.

The page itself loads its interface from the hosting service and a public font stylesheet. Borrower-entered calculator values are neither sent nor stored by application code.

## Professional boundary

Outputs are educational estimates, not transaction-specific advice, eligibility, a quote, a commitment, or a lending decision. Users should confirm the definitions, inputs, method, and threshold relevant to their transaction with the appropriate lender and professional advisers.
