# HyperPersonal

**Every Customer Is Different. Every Experience Should Be Too.**

HyperPersonal is a lightweight full-stack hackathon demo for StyleSphere. A zero-dependency Node server serves the SPA and same-origin JSON APIs. Synthetic customer signals drive explainable hybrid product ranking, transparent heuristic baselines, contextual Thompson-sampling decisions, a personalized storefront, catalog-grounded assistance, marketing drafts, and simulated reward updates.

## Run

Requires Node.js 18+; there are no package dependencies.

```sh
npm start
```

Open http://127.0.0.1:4173. Set `PORT` to change the port or `HOST` to change the bind address (default `127.0.0.1`; hosted service typically requires `0.0.0.0`). The app initializes a file-backed JSON store at `data/demo-db.json` for bandit state and interaction events. The demo works without API credentials. Optional server-side language-model support accepts either an [OpenAI Responses API](https://platform.openai.com/docs/quickstart) key (`OPENAI_API_KEY`) or a [Gemini Developer API](https://ai.google.dev/gemini-api/docs/quickstart) key (`GEMINI_API_KEY`); OpenAI takes precedence if both are set. Gemini's free tier is limited to eligible models and quotas, and Google may use free-tier submitted content to improve its products. Configure either key only on the server; the deterministic local fallback works without them. Google Fonts and Unsplash photography are optional remote assets.

For Vercel configuration, environment variables, and its temporary storage limitation, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Demo path

1. Overview → select Amelia or Jordan from Customer 360.
2. Generate experience and inspect ranked products, content, chosen action, and decision signals.
3. Open Live storefront and switch between customers; ranking and copy adapt from each profile.
4. Ask the assistant a product question such as “workwear under $100”; returned facts include catalog IDs and stock.
5. Trust & governance → paste a frustrated message and analyze the deterministic sentiment baseline.
6. Optimization lab → run simulated rounds, or generate an experience and record a positive/no-response outcome.
7. Experience studio → choose a channel, product and goal to create a personalized marketing draft; review it before use.
8. Insights & analytics → see persisted interaction counts and a recent event log. No customer message body is stored.

All customer records, catalog interactions, and feedback outcomes are synthetic. Dashboard lines are illustrative, not measured results. Bandit parameters, feedback count, consent, selected profile, pending action, and generated experience persist in browser local storage and sync to the JSON API when available. Local server data is file-backed; Vercel server data uses temporary instance-local storage and is not durable across cold starts. See [DEMO_GUIDE.md](DEMO_GUIDE.md), [AI_SYSTEM.md](AI_SYSTEM.md), and [ETHICAL_AI.md](ETHICAL_AI.md).

## Scope and limitations

This intentionally lightweight MVP uses deterministic synthetic catalog/profile seed data and baseline heuristics. It does not train predictive ML, send messages, change prices, or implement federated learning. Recommendations use customer preferences, seeded purchases, persisted catalog-interest events, a weighted content/popularity/price ranker, and item-item cosine over synthetic co-purchase events when history exists; new profiles fall back without a collaborative claim. The assistant retrieves canonical server-side catalog records; an optional OpenAI or Gemini language model can only rerank retrieved IDs and cannot supply product facts. Analytics and fractional bandit rewards are demo proxies, not commerce outcomes. See [ARCHITECTURE.md](ARCHITECTURE.md), [AI_SYSTEM.md](AI_SYSTEM.md), and [DEPLOYMENT.md](DEPLOYMENT.md).

## API

- `GET /api/health` — server, storage, and optional LLM configuration status.
- `GET /api/state`, `PUT /api/state` — persistent bandit parameters.
- `POST /api/events`, `GET /api/analytics` — validated, message-free interaction log and summary.
- `POST /api/assistant/answer` — server-side catalog retrieval and grounded answer; optional LLM ID reranking.
- `POST /api/content/generate` — customer-aware copy draft; optional server-side LLM, deterministic fallback otherwise.

Run `npm test` for algorithm, workflow, API validation and persistence tests.

## Submission links and status

- **Live application:** [hyper-personal.vercel.app](https://hyper-personal.vercel.app) (deployment currently returns `500 FUNCTION_INVOCATION_FAILED`; do not present it as judge-ready until a redeploy passes smoke checks).
- **GitHub repository:** [HyperPersonal](https://github.com/rinoyhasan5/HyperPersonal) (configured `origin` remote; confirm the repository is publicly accessible to judges before submission).
- **Three-minute demo guide:** [DEMO_GUIDE.md](DEMO_GUIDE.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **AI system:** [AI_SYSTEM.md](AI_SYSTEM.md)
- **Build provenance:** [BUILD_PROVENANCE.md](BUILD_PROVENANCE.md)
- **Judging brief:** [SUBMISSION_BRIEF.md](SUBMISSION_BRIEF.md)
- **Manual browser QA checklist:** [MANUAL_QA.md](MANUAL_QA.md)
- **Business model:** [BUSINESS_MODEL.md](BUSINESS_MODEL.md)
- **Ethical AI and privacy:** [ETHICAL_AI.md](ETHICAL_AI.md)
- **Team and contributions:** [TEAM.md](TEAM.md) (placeholders require team completion)
- **Demo video:** None found in the repository; do not present a link until a video exists.

Automated tests pass, but the current Vercel deployment fails at runtime and the full browser QA checklist remains open; see [MANUAL_QA.md](MANUAL_QA.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
