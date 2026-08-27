# SBA Loan Preflight

A privacy-first repayment preflight for small-business borrowers, developed from [Dilia Wood's public SBA loan preparation article](https://www.diliawood.com/sba-loan-what-to-do-before-you-apply/).

**Live application:** [preflight.diliawood.com](https://preflight.diliawood.com)

The application models a proposed principal-and-interest payment, adds existing annual business debt service, and compares the resulting debt service coverage ratio (DSCR) with a threshold selected by the borrower. It is educational preparation—not a lender decision engine.

## Product principles

- **Borrower-controlled:** examine your own ability to repay before a lender evaluates the wider file.
- **Private by design:** no account, analytics, storage, or transmission of calculator inputs.
- **Arithmetic before interpretation:** the payment, total debt service, DSCR, threshold-associated NOI, and difference are visible.
- **No false certainty:** results are described as above, at, or below the selected comparison—not pass/fail, approval, or eligibility.
- **Public-source boundary:** v1.0 uses only the calculator already published outside the paid Loan-Ready Kit.

## What v1.0 includes

- Annual NOI and existing annual business debt service
- Proposed loan amount, annual rate, and term
- User-controlled comparison threshold
- Fixed-payment amortization, including a zero-interest case
- Full-precision classification with disclosed display rounding
- Field-level validation, keyboard focus management, and an announced result region
- Clearly labeled synthetic example
- Methodology, primary-source link, privacy statement, and professional boundary

It intentionally excludes Global Cash Flow, eligibility, approval prediction, collateral, credit, injection, saved scenarios, paid-kit content, and transaction-specific advice. The public project-cost/injection module remains a documented v1.1 candidate.

## Calculation

For principal `P`, monthly rate `r`, and number of monthly payments `n`:

```text
monthly payment = P × r / (1 - (1 + r)^-n)
```

At a zero rate, monthly payment is `P / n`. The application annualizes twelve payments, adds existing annual debt service, and calculates:

```text
DSCR = annual NOI / total modeled annual debt service
```

See [accuracy and methodology](docs/accuracy-and-methodology.md) for the calculation contract, test evidence, source boundary, and rounding rules.

## Run locally

Prerequisites: Node.js `>=22.13.0`, Linux, `flock`, `curl`, and GNU `timeout`.

```bash
npm ci
npm test
npm run dev
```

`npm test` runs the pure calculation suite, a verified production build, and a rendered-HTML smoke test. `npm run lint` runs the source lint check.

## Architecture

- React 19 + TypeScript
- Vinext/Vite production build
- Pure calculation engine in `lib/dscr.ts`
- Node test runner for calculation and rendered-output checks
- OpenAI Sites production lifecycle
- GitHub Actions continuous integration

The calculation core has no React, network, storage, date, or policy dependency. That keeps later adapters—such as an embed, a documented API, an MCP tool, or a private organizational agent—possible without turning v1.0 into a sales surface.

## Documentation

- [Accuracy and methodology](docs/accuracy-and-methodology.md)
- [Agent collaboration record](docs/agent-collaboration.md)
- [Public calculator recovery audit](docs/legacy-recovery-notes.md)
- [Product brief](docs/product-brief.md)
- [Changelog](CHANGELOG.md)

## License and professional boundary

Copyright © Dilia Wood. All rights reserved.

This software provides educational estimates. It is not a lender, broker, packager, CDC, CPA, attorney, eligibility tool, underwriting system, quote, commitment, or lending decision. Confirm the assumptions and method for a specific transaction with the appropriate professionals.
