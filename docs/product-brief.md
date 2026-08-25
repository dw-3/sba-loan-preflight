# Product brief: SBA Loan Preflight v1.0

**Status:** Proposed  
**Owner:** Dilia Wood  
**Prepared:** 2026-08-25  
**Repository:** `dw-3/sba-loan-preflight`

## Product decision

Build one responsive, privacy-first repayment preflight for small-business borrowers.

The first release will let a borrower model a proposed principal-and-interest payment, combine it with existing annual business debt service, calculate a debt service coverage ratio, and compare the result with a threshold the borrower chooses.

The application is educational preparation. It is not a lender decision engine.

## Problem

Borrowers often encounter repayment calculations after they have entered a lender process. At that point, an unfavorable relationship appears under deadline and in someone else's analysis.

A borrower should be able to examine the same basic arithmetic earlier, privately, with enough transparency to understand which input changed the result.

## Target user

A U.S. small-business owner considering SBA-backed financing who:

- has an estimate of annual net operating income;
- knows or can estimate current annual business debt service;
- wants to model a proposed loan amount, rate, and term;
- needs an educational view before requesting transaction-specific lender guidance.

The user is not expected to understand GitHub, financial modeling software, or amortization formulas.

## Product thesis

> Examine your own ability to repay using transparent arithmetic before a lender evaluates the wider file.

This is borrower self-assessment language. It does not mean that the user can approve a loan, reproduce a lender's complete underwriting method, establish SBA eligibility, or predict a credit decision.

## v1.0 user outcome

A user can:

1. enter annual NOI, existing annual debt service, proposed principal, annual rate, term, and a comparison threshold;
2. see the estimated annual principal-and-interest payment;
3. see total modeled annual debt service;
4. see the calculated DSCR;
5. see the NOI associated with the selected threshold;
6. see the resulting cushion or shortfall;
7. understand the formula, assumptions, rounding, privacy behavior, and limitations;
8. reset the form or load a clearly labeled synthetic example.

## Inputs

| Field | Type | Rules |
|---|---|---|
| Annual net operating income | Currency | Required; finite; zero or greater |
| Existing annual debt service | Currency | Required; finite; zero or greater |
| Proposed loan amount | Currency | Required; finite; greater than zero |
| Annual interest rate | Percentage | Required; finite; zero or greater |
| Term | Years | Required; finite; greater than zero |
| Comparison threshold | Ratio | Required; finite; greater than zero |

### Input behavior

- The initial form is blank.
- A separate action loads a synthetic example.
- Formatting must not change the underlying value unexpectedly.
- Invalid entries remain visible and receive a specific field-level error.
- Calculation occurs only when the required inputs are valid.
- Technical upper bounds may prevent non-finite calculations, but must not be presented as SBA or lender limits.
- No explicit user entry may be silently replaced by a default.

## Calculation contract

The calculation engine will be a pure module with no UI, network, storage, date, or policy dependencies.

For a proposed principal (P), annual nominal rate (i), and term (y):

[
r = \frac{i}{12}
]

[
n = 12y
]

For (r > 0):

[
\text{monthly payment} = \frac{Pr}{1-(1+r)^{-n}}
]

For (r = 0):

[
\text{monthly payment} = \frac{P}{n}
]

[
\text{proposed annual payment} = 12 \times \text{monthly payment}
]

[
\text{total annual debt service} =
\text{existing annual debt service} +
\text{proposed annual payment}
]

[
\text{DSCR} =
\frac{\text{annual NOI}}
{\text{total annual debt service}}
]

[
\text{NOI associated with selected threshold} =
\text{selected threshold} \times
\text{total annual debt service}
]

[
\text{cushion or shortfall} =
\text{annual NOI} -
\text{threshold-associated NOI}
]

### Precision

- Calculate with full JavaScript numeric precision.
- Base interpretation on unrounded values.
- Display currency to the nearest whole dollar by default.
- Display DSCR to two decimal places.
- Disclose that displayed rounding may make a boundary appear exact even when the underlying values differ slightly.
- Unit tests must cover exact-threshold values and values immediately above and below a threshold.

## Interpretation

Permitted states:

- Below selected threshold
- At selected threshold
- Above selected threshold

Interpretation must say:

- the threshold was selected by the user or loaded as an example;
- lenders may use different definitions, adjustments, time periods, and thresholds;
- the result covers the entered business cash flow and debt only;
- the result does not model global cash flow, eligibility, collateral, credit, injection, policy exceptions, or approval.

Avoid:

- pass or fail;
- approved or declined;
- qualifies or does not qualify;
- safe or unsafe loan;
- exact lender result;
- universal SBA threshold.

## Information architecture

### 1. Orientation

A short explanation of what the tool models and what it does not determine.

### 2. Input panel

Plain-language fields, short definitions, validation near each field, and an optional synthetic example.

### 3. Result

A high-readability DSCR result with the selected comparison threshold and neutral state language.

### 4. Calculation detail

Proposed annual payment, total annual debt service, entered NOI, threshold-associated NOI, and cushion or shortfall.

### 5. Explain the math

Formula definitions, zero-rate behavior, annualization, and rounding.

### 6. Boundaries and sources

Lender variability, excluded underwriting factors, last-reviewed date, and links to current primary sources.

### 7. Privacy

A precise statement that calculation inputs remain in the browser and are not transmitted or stored by the application.

### 8. Relationship to Dilia's work

A restrained link to the originating public article. The application is not a sales page and does not force a paid-product path.

## Privacy

v1.0 will:

- perform calculations in the browser;
- use no account system;
- send no calculator input to a server;
- use no analytics, advertising, session replay, or behavioral tracking;
- store no calculator input in cookies, local storage, session storage, IndexedDB, or URLs;
- require no SSN, tax ID, bank credential, document upload, personal identity data, or precise location.

The privacy statement will be tested against the production build and network behavior before release.

## Accessibility

Target WCAG 2.2 AA behavior, including:

- semantic headings, form controls, labels, descriptions, and errors;
- complete keyboard operation;
- visible focus states;
- sufficient contrast;
- result changes announced without excessive interruption;
- validation that does not depend on color;
- touch targets appropriate for mobile use;
- no motion required to understand state;
- support for browser zoom and reflow;
- useful behavior with JavaScript enabled, with a clear message if it is unavailable.

Automated checks supplement, but do not replace, keyboard and screen-reader-oriented manual QA.

## Visual direction

- premium but utilitarian;
- calm and evidence-led;
- navy, warm neutral surfaces, and restrained gold accent;
- strong numerical readability;
- clear separation between input, arithmetic, interpretation, and boundary;
- no generic lender portal, fintech dashboard, or SaaS-marketing aesthetic.

## Technical direction

Proposed stack:

- TypeScript
- React
- Vite
- a pure calculation module
- Vitest for unit and component tests
- Playwright for critical browser behavior
- static deployment through GitHub Pages
- GitHub Actions for test, build, and deployment workflows

The public calculation core must not depend on React so it can later support:

- an embeddable or white-label interface;
- a documented API adapter;
- an MCP tool;
- organization-specific interfaces.

Those future uses are architectural considerations, not v1.0 features.

## Explicit non-goals

v1.0 will not include:

- project cost or borrower contribution;
- Global Cash Flow;
- eligibility analysis;
- approval prediction;
- lender or CDC comparison;
- credit scoring;
- collateral analysis;
- document collection;
- amortization schedules;
- refinancing or variable-rate modeling;
- PDF reports;
- accounts or saved scenarios;
- paid Kit content;
- advertising, checkout, subscriptions, or lead-gated results;
- an MCP server or private organizational agent.

## Documentation deliverables

Before release:

- README
- methodology
- accuracy boundaries
- privacy
- legacy recovery notes
- agent-collaboration record
- changelog
- synthetic test cases
- manual QA checklist
- screenshots
- release notes

## Acceptance criteria

v1.0 is ready when:

- the calculation matches documented synthetic cases;
- zero-rate and exact-threshold cases behave correctly;
- invalid, negative, empty, and extreme inputs fail safely;
- no calculator input leaves or persists in the browser;
- the complete experience works on current phone and desktop viewport sizes;
- keyboard QA is complete;
- result announcements and errors are understandable with assistive technology;
- methodology, assumptions, limitations, rounding, and source-review date are visible;
- the repository contains reviewable development history;
- CI passes on the release commit;
- the live application is available at a stable public URL;
- a versioned GitHub release exists;
- the commercial Loan-Ready Kit remains untouched.

## Release roadmap

### v1.0

Repayment / DSCR preflight.

### v1.1 candidate

Project cost / borrower contribution, subject to a separate specification and current-source validation.

### Later

Global Cash Flow, white-label delivery, private organizational agents, and MCP distribution only after separate requirements, privacy, compliance, and commercial review.
