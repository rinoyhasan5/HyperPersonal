# HyperPersonal

**Every Customer Is Different. Every Experience Should Be Too.**

HyperPersonal is a lightweight full-stack hackathon demo for StyleSphere. A zero-dependency Node server serves the SPA and same-origin JSON APIs. Synthetic customer signals drive explainable hybrid product ranking, transparent heuristic baselines, contextual Thompson-sampling decisions, a personalized storefront, catalog-grounded assistance, marketing drafts, and simulated reward updates.

## Run

Requires Node.js 18+; there are no package dependencies.

```sh
npm start
```

Open http://127.0.0.1:4173. Set `PORT` to change the port or `HOST` to change the bind address (default `127.0.0.1`; hosted service typically requires `0.0.0.0`). The app initializes a file-backed JSON store at `data/demo-db.json` for bandit state and interaction events. The demo works without API credentials. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to enable server-side [OpenAI Responses API](https://platform.openai.com/docs/quickstart) generation for assistant reranking and marketing drafts; requests fall back to deterministic grounded behavior if no key is configured or the provider is unavailable. The API key never enters the frontend. Google Fonts and Unsplash photography are optional remote assets.

## Demo path

1. Overview → select Amelia or Jordan from Customer 360.
2. Generate experience and inspect ranked products, content, chosen action, and decision signals.
3. Open Live storefront and switch between customers; ranking and copy adapt from each profile.
4. Ask the assistant a product question such as “workwear under $100”; returned facts include catalog IDs and stock.
5. Trust & governance → paste a frustrated message and analyze the deterministic sentiment baseline.
6. Optimization lab → run simulated rounds, or generate an experience and record a positive/no-response outcome.
7. Experience studio → choose a channel, product and goal to create a personalized marketing draft; review it before use.
8. Insights & analytics → see persisted interaction counts and a recent event log. No customer message body is stored.

All customer records, catalog interactions, and feedback outcomes are synthetic. Dashboard lines are illustrative, not measured results. Bandit parameters, feedback count, consent, selected profile, pending action, and generated experience persist in browser local storage and sync to the JSON API when available. See [DEMO_GUIDE.md](DEMO_GUIDE.md), [AI_SYSTEM.md](AI_SYSTEM.md), and [ETHICAL_AI.md](ETHICAL_AI.md).

## Scope and limitations

This intentionally lightweight MVP uses deterministic synthetic catalog/profile seed data and baseline heuristics. It does not train predictive ML, send messages, change prices, or implement federated learning. Recommendations use customer preferences, seeded purchases, persisted catalog-interest events, a weighted content/popularity/price ranker, and item-item cosine over synthetic co-purchase events when history exists; new profiles fall back without a collaborative claim. The assistant retrieves canonical server-side catalog records; the optional LLM only reranks retrieved IDs and cannot supply product facts. Analytics and fractional bandit rewards are demo proxies, not commerce outcomes. See [ARCHITECTURE.md](ARCHITECTURE.md), [AI_SYSTEM.md](AI_SYSTEM.md), and [DEPLOYMENT.md](DEPLOYMENT.md).

## API

- `GET /api/health` — server, storage, and optional LLM configuration status.
- `GET /api/state`, `PUT /api/state` — persistent bandit parameters.
- `POST /api/events`, `GET /api/analytics` — validated, message-free interaction log and summary.
- `POST /api/assistant/answer` — server-side catalog retrieval and grounded answer; optional LLM ID reranking.
- `POST /api/content/generate` — customer-aware copy draft; optional server-side LLM, deterministic fallback otherwise.

Run `npm test` for algorithm, workflow, API validation and persistence tests.

## Submission links and status

- **Live application:** Not deployed; no live URL is available.
- **GitHub repository:** No remote URL is configured in this workspace. Publish the repository and add its verified URL before submission.
- **Three-minute demo guide:** [DEMO_GUIDE.md](DEMO_GUIDE.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **AI system:** [AI_SYSTEM.md](AI_SYSTEM.md)
- **Build provenance:** [BUILD_PROVENANCE.md](BUILD_PROVENANCE.md)
- **Manual browser QA checklist:** [MANUAL_QA.md](MANUAL_QA.md)
- **Business model:** [BUSINESS_MODEL.md](BUSINESS_MODEL.md)
- **Ethical AI and privacy:** [ETHICAL_AI.md](ETHICAL_AI.md)
- **Team and contributions:** [TEAM.md](TEAM.md) (placeholders require team completion)
- **Demo video:** None found in the repository; do not present a link until a video exists.

No browser QA has been performed. Automated tests and a manual checklist are provided; see [MANUAL_QA.md](MANUAL_QA.md).
