# Agent collaboration record

This repository is intentionally structured as inspectable proof of work—not a one-shot code upload.

## Human decisions

The brand team supplied the project handoff, confirmed that gated content required author permission, chose to avoid that bottleneck while the author was out of office, and approved borrower-directed wording about evaluating “your own ability to repay.” The live public article and its public calculator were authorized as the v1 source boundary.

## Agent-assisted work

AI coding agents supported:

- recovery and documentation of the legacy calculator behavior;
- primary-source checks and separation of arithmetic from mutable policy;
- product scoping and release sequencing;
- calculation-engine implementation and boundary tests;
- accessible interface implementation;
- privacy and professional-boundary language;
- visual system and social-preview asset development;
- production build, deployment, and GitHub release workflow.

## Controls used

- The legacy implementation was audited before it was replaced.
- Gated and paid-kit materials were treated as out of scope, not inferred.
- The calculation engine is isolated from interface copy and policy claims.
- Synthetic scenarios, not customer or borrower records, are used in tests.
- Changes move through issues, branches, pull requests, CI, and documented checkpoints.
- The public result avoids pass/fail, eligibility, and approval predictions.

## Durable operating model

GitHub is the public system of record for the source, decisions, tests, and release history. The deployed application is the public demonstration. This separation supports future monetization without selling the public kit itself: the same verified calculation core could later power a licensed embed, a private borrower-intelligence agent, a professional implementation service, or an organization-specific workflow—with separate authorization and compliance review.

Those extensions are not present in v1.0. Keeping them outside the initial release protects trust while preserving a credible product and services path.
