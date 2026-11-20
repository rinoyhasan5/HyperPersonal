# HyperPersonal — judge-ready brief

## One-sentence pitch

HyperPersonal turns a small customer profile into an inspectable product recommendation, next-best-experience decision, and catalog-grounded answer, while keeping the demo's assumptions and limits visible.

## Innovation

The differentiator is the connected decision journey: profile signals inform product ranking and action eligibility; a contextual Thompson sampler ranks eligible actions; the interface exposes score factors, uncertainty, trade-offs, and a no-action option; and catalog answers are composed from canonical in-stock product records. Optional LLM use is bounded to reranking retrieved product IDs or drafting copy from supplied facts. This is an explainability and review design, not a claim of novel or trained ML.

## Technical execution

The browser SPA and zero-dependency Node HTTP server share canonical synthetic catalog and customer records. The recommendation workflow combines weighted preference fit, a small synthetic co-purchase cosine signal, popularity, and price fit. A contextual Beta-Bernoulli Thompson sampler selects among consent-eligible actions and updates per-customer/action parameters with explicitly simulated rewards. The shopping assistant retrieves in-stock catalog items using keyword, synonym, and budget matching; the server validates optional reranked IDs and writes the answer from canonical records. Without an API key or provider response, deterministic local answers and marketing templates keep the core demo usable.

The system has passing automated coverage for its API handlers, validation, storage, ranking, action policy, retrieval, and demo journey. It is not a trained model, does not connect to a live commerce event stream, and has no measured conversion or retention lift. See [AI_SYSTEM.md](AI_SYSTEM.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [BUILD_PROVENANCE.md](BUILD_PROVENANCE.md).

## Business model and adoption path

The proposed buyers are commerce brands, marketplaces, and CRM/retention teams. The proposed SaaS model prices by catalog size, event volume, and workspace needs, with enterprise services for deployment, controls, and integrations. Existing plan prices in the UI are illustrative placeholders. An adoption path is: run a synthetic-data demo; connect a consented catalog and a small first-party event feed; evaluate in shadow mode; then test an approved experience against a randomized holdout before considering paid rollout. No paying customers, pilots, or willingness-to-pay research are claimed. See [BUSINESS_MODEL.md](BUSINESS_MODEL.md).

## Impact, measurement, and responsible use

The intended benefit is more relevant discovery and fewer inappropriate interruptions. No gain has been measured yet. A real pilot should pre-register a primary KPI such as incremental repeat purchase or qualified product engagement, use a randomized holdout, define a sample-size and duration plan, and monitor guardrails: unsubscribe/opt-out, complaint rate, return rate, discount cost, exposure parity, and human escalation. Report confidence intervals and segment-level outcomes before making a lift claim.

This demo uses synthetic data, stores no sentiment message body, asks for human approval before generated marketing copy is used, and retains a no-action option. Production use would require explicit consent, data minimization, access controls, tenant isolation, retention/deletion controls, security review, and bias monitoring. See [ETHICAL_AI.md](ETHICAL_AI.md).

## Scalability and global readiness

The components separate UI, ranking, action selection, retrieval, and storage. The local JSON store is appropriate only for a single-process demo. Vercel uses temporary instance-local storage; durable shared state requires a provisioned database or KV adapter. The catalog and copy are currently English/USD and US-oriented. Bangladesh and diaspora use cases are opportunities to validate through local retailers and NRB collaborators, not existing partnerships. A credible expansion should add Bangla and locale-aware catalog fields, regional price/shipping data, and jurisdiction-specific consent and retention rules before launch.

## Three-minute presentation outline

1. **Problem (20 sec):** broad segments miss individual intent; explain that this demo tests a reviewable alternative.
2. **Profile to product (40 sec):** switch between the two fictional profiles and show recommendation factors.
3. **Decision reasoning (35 sec):** generate an experience; explain eligibility, posterior sample, context prior, uncertainty, and why “No action” can win.
4. **Grounded assistant (35 sec):** ask for workwear under a budget; show catalog IDs, price, and stock; demonstrate the unsupported-question fallback.
5. **Responsible content (25 sec):** analyze frustrated text locally; generate a draft; explain that no message is sent and human review is required.
6. **Evidence and limits (25 sec):** record simulated feedback, show event analytics, and clearly label the outcome as synthetic. Close with the planned holdout experiment and the Vercel persistence limitation until durable storage is configured.

## Submission status to complete before judging

- Confirm the production deployment passes `/api/health`, static asset, assistant, and event-write smoke checks after the latest commit is deployed.
- Replace temporary Vercel storage with a provisioned durable database if judges expect cross-instance persistence.
- Add verified team names, roles, and contributions in [TEAM.md](TEAM.md).
- Attach the actual demo video, repository, and presentation materials to the submission form.
- Do not claim trained ML, real conversion data, external integrations, measured gains, partnerships, or production readiness.
