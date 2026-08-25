# Public calculator recovery audit

**Status:** Initial audit  
**Reviewed:** 2026-08-25  
**Tracking issue:** #1

## Source and boundary

The supplied legacy implementation is the calculator published in:

- [The $10 Million SBA Loan: What I'd Do Before Applying](https://www.diliawood.com/sba-loan-what-to-do-before-you-apply/)

It contains two public modules:

1. Debt service coverage / proposed repayment
2. Project cost / borrower contribution

The original Ghost block has been preserved outside this public repository. This document records behavior and decisions without treating the legacy code as the new implementation.

Gated calculators are explicitly deferred. They may be compared later with author permission, but they are not a dependency for the public application.

## Recovered DSCR behavior

### Inputs

| Input | Legacy default |
|---|---:|
| Annual net operating income | $180,000 |
| Existing annual debt service | $0 |
| Proposed loan amount | $1,000,000 |
| Annual interest rate | 7.5% |
| Term | 25 years |
| User-selected comparison threshold | 1.25 |

### Arithmetic

Let:

- (P) = proposed principal
- (i) = annual nominal interest rate as a decimal
- (r = i / 12) = monthly rate
- (n = 12 \times \text{term in years})
- (A) = annual proposed principal-and-interest payment
- (E) = existing annual debt service
- (N) = annual net operating income
- (T) = user-selected comparison threshold

For a non-zero rate:

[
A = 12 \times \frac{P r}{1-(1+r)^{-n}}
]

For a zero rate:

[
A = \frac{P}{\text{term in years}}
]

Then:

[
\text{total annual debt service} = E + A
]

[
\text{DSCR} = \frac{N}{E+A}
]

[
\text{NOI associated with the selected threshold} = T(E+A)
]

The legacy interface presents the difference between actual NOI and that threshold-associated NOI as a cushion or shortfall.

### Interpretation behavior

The legacy interface compares the unrounded ratio with the user-entered threshold and presents:

- short of threshold;
- just clears; or
- clears threshold by at least 0.15.

The ratio is displayed to two decimal places. Currency output is rounded to the nearest dollar.

## Recovered project-cost behavior

The legacy implementation adds purchase price, construction or renovation, equipment, closing costs and financed fees, and working capital into a displayed total project cost.

For a 504 scenario, it applies:

- 10% borrower contribution as the baseline;
- an additional 5 percentage points when the business has operated two years or less;
- an additional 5 percentage points for limited or single-purpose property;
- a displayed 50% third-party lender share;
- a displayed CDC share equal to the remaining percentage.

For a 7(a) scenario, the borrower contribution is a user-entered percentage and the remaining project cost is displayed as the lender share.

## Primary-source check

Current federal regulation states that 504 permanent financing **typically** combines the borrower contribution, third-party financing, and the 504 loan. It describes a typical 10% / 50% / 40% structure rather than making that exact split universal. See [13 CFR § 120.900](https://www.ecfr.gov/current/title-13/chapter-I/part-120/subpart-H/section-120.900).

Current regulation sets minimum borrower contributions of:

- 15% when the borrower or operating company has operated for two years or less;
- 15% for a limited or single-purpose building or structure;
- 20% when both conditions apply;
- 10% in other circumstances.

See [13 CFR § 120.910](https://www.ecfr.gov/current/title-13/chapter-I/part-120/subpart-H/subject-group-ECFRc64be25e87f1150/section-120.910).

SBA's lender overview describes the third-party lender as covering up to 50%, the CDC debenture as covering up to 40%, and the borrower as contributing at least 10%. See [SBA lenders](https://www.sba.gov/sba-lenders/).

SBA states that most 7(a) term loans use monthly principal-and-interest payments and that repayment terms vary. See [7(a) loans](https://www.sba.gov/loans/7a-loans/).

### Source-boundary decision

The 504 contribution tiers have a primary regulatory basis, but the complete displayed financing split must be described as typical or illustrative. Transaction-specific structure remains a CDC/lender determination.

The first DSCR release will not embed a mutable SBA threshold. A comparison threshold may be user-controlled and may load with an explicitly labeled example value. It must not be described as SBA approval policy.

## Implementation risks found

| Area | Legacy behavior | Round 2 requirement |
|---|---|---|
| Invalid input | Invalid or empty text silently becomes zero | Field-level validation with specific messages |
| Negative values | Negative monetary values, rates, and terms are accepted | Reject negative values |
| Zero term | Produces no proposed payment without a useful field error | Require a positive term when principal is entered |
| Threshold zero | Silently falls back to 1.25 | Never replace an explicit entry silently |
| Rounding | Displayed currency rounds while status uses full precision | Document full-precision calculation and display rounding |
| Policy copy | A 2026 7(a) Small Loan statement is embedded in JavaScript | Keep mutable policy outside the engine and date its review |
| 504 structure | Displays a fixed 50% bank share | Label typical assumptions or make them configurable |
| Tabs | Clickable but incomplete keyboard tab pattern | Implement full keyboard interaction |
| Results | Visual changes are not announced | Use an appropriate live region and focus behavior |
| Clipboard | Success is shown even when writing may fail | Confirm success only after the clipboard promise resolves |
| Rendering | Dynamic interpretation is assembled as HTML | Render controlled text and semantic elements |
| Privacy | Calculator block itself makes no network calls | Preserve local computation; ship v1 without analytics |
| Copy | Some statements sound universal | Distinguish arithmetic, examples, lender practices, and policy |

## Public-copy decisions

Approved:

- borrower-directed language about evaluating **your own ability to repay**, provided it is clearly a self-assessment and not institutional approval.

Do not inherit without revision:

- language implying the tool reproduces every underwriter's method;
- unsupported frequency claims such as a condition being the most common reason for a lending outcome;
- mutable program thresholds embedded as timeless explanatory text;
- pass/fail or approval framing.

## Release recommendation

### v1.0

Ship the repayment / DSCR preflight only.

Reasons:

- it is the smallest complete and independently testable module;
- its core arithmetic is not program-specific;
- it can demonstrate privacy, accessibility, tests, release discipline, and transparent methodology without encoding a full lender decision model;
- it creates a meaningful later release rather than collapsing the roadmap into one upload.

### v1.1 candidate

Add project cost / borrower contribution after:

- documenting the exact project-cost input model;
- labeling the 504 structure as typical or illustrative;
- deciding whether the financing shares should be configurable;
- validating 7(a) language separately;
- adding regulatory last-reviewed metadata and test cases.

### Later

Global Cash Flow remains excluded until household, affiliate, privacy, and lender-method boundaries are explicitly defined.

## Public/private IP boundary

The public repository may contain:

- fresh Round 2 source;
- public-facing explanations written for this application;
- formulas and definitions approved for public use;
- synthetic tests;
- methodology, validation, and agent-collaboration documentation.

It must not contain:

- paid Loan-Ready Kit curriculum or Working Papers;
- gated calculator implementations without explicit approval;
- member or customer data;
- Ghost membership or payment logic;
- unpublished operational research;
- secrets, credentials, or private agent scratch work.
