# Three-minute HyperPersonal demo

## Setup

1. Run `npm start`, then open `http://127.0.0.1:4173`.
2. For a clean repeat, remove `data/demo-db.json` and the `hyperpersonal:*` local-storage keys for this origin, then reload. This resets the synthetic interaction log and bandit priors.
3. Optionally copy `.env.example` to `.env` and set `OPENAI_API_KEY` or `GEMINI_API_KEY`. The server reports provider availability in Trust & governance. Leave both unset for the deterministic local fallback.
4. Profiles, catalog, interaction events and priors are synthetic. Do not present them as measured customer or business results.

## Live run (3 minutes)

| Time | Action | What to show |
|---|---|---|
| 0:00–0:20 | Open Overview; click View customers | Two populated fictional profiles with explicit heuristic estimates. |
| 0:20–0:45 | Select Amelia; click Generate personalized experience | Show the score component weights and synthetic co-purchase similarity, then the context-prior/Thompson action choice, expected simulated reward, and trade-off. Customer 360 explains baseline score inputs. |
| 0:45–1:05 | Open Live storefront; switch to Jordan; refresh | Product prices and storefront copy change with the selected profile. Consent off switches to a generic view. |
| 1:05–1:30 | Open Shopping assistant; ask “workwear under $100” | Server retrieval searches the canonical catalog first. If configured, the LLM chooses only among retrieved IDs; the server renders every name, price, stock count, and description. Unsupported questions get a no-match response. |
| 1:30–1:48 | Trust & governance; enter “I’m frustrated my order is late and damaged”; analyze | Lexicon baseline labels negative sentiment and recommends human support. Message text is not stored or sent to the LLM. |
| 1:48–2:12 | Experience studio; pick Email, a product, and goal “Introduce new workwear”; generate draft | Shows the local template or configured OpenAI/Gemini provider label. Explain that it is a draft and requires human approval; nothing is sent. |
| 2:12–2:40 | Optimization lab; generate an action and submit positive or no-response feedback | Fractional alpha/beta reward mass updates for the selected customer/action and syncs to local storage plus the JSON backend. Explain the simulated response, engagement, revenue proxy, retention, experience, and discount-cost terms. |
| 2:40–3:00 | Insights & analytics | Show current event counts and the recent interaction log. Local runs use the JSON file; Vercel uses temporary instance-local storage. Conversion, revenue, and real campaign performance are not connected. |

## Reproducibility and reset

- The customer profiles, catalog, and co-purchase interaction matrix are deterministic synthetic seeds. Customer scores are transparent heuristics, not trained model predictions.
- Bandit selection uses seeded Beta posterior samples blended with a customer-context prior; fractional reward parameters persist in browser local storage. Local runs also sync to the JSON file store; Vercel server sync is temporary and instance-local. Feedback is simulated and is not evidence of customer behavior.
- `POST /api/events` uses idempotent event IDs. Events can queue in local storage while offline and sync when the API returns.
- The 14-day offer recommendation cap is local demo policy state. It does not represent an offer delivery or external campaign frequency system.
- To reset local backend state, stop the server and delete `data/demo-db.json`. Vercel's temporary backend state resets when its temporary instance storage is cleared. To reset browser state, remove local-storage keys beginning `hyperpersonal:` for the demo origin.
- Product images and fonts are remote optional assets; the data and core algorithms work without them.
