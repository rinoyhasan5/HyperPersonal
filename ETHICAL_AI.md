# Ethical AI, privacy, and governance

## Current demo safeguards

- All included customer, catalog, interaction, and reward records are synthetic. Do not replace them with real personal data for a public demo.
- The UI exposes a consent toggle and disables personalized recommendations for opted-out profiles. The toggle is browser-local demo state, not a server-authoritative consent ledger.
- No email, SMS, offer, price change, campaign publication, or other external customer action is executed. Marketing is draft-only and visibly requires human approval.
- A no-action option remains eligible. Offer recommendations have a local 14-day cap and a proposed 10% maximum; no discount is actually issued.
- Scores are bounded heuristic estimates with visible signal contributions. They are not trained predictions or calibrated probabilities. Recommendations expose reason codes and synthetic-data limitations.
- Sentiment is a local keyword baseline. It suggests human support for negative terms and does not store or send the message text.
- The event log records bounded metadata such as synthetic profile ID, product ID, action, channel, and simulated outcome. It excludes chat and sentiment message bodies.
- The JSON store and browser storage are local demo persistence only. There is no authentication, tenant boundary, encryption-at-rest guarantee, retention job, or production access control.

## Optional external LLM processing

When `OPENAI_API_KEY` is configured, shopping questions and retrieved synthetic catalog facts are sent to the server-side OpenAI Responses API. The model can choose among retrieved product IDs; the server validates the IDs and constructs product facts from the canonical catalog. Marketing generation sends a synthetic first name/style summary, product facts, channel, and the requested goal. Do not submit sensitive real-customer information or confidential business data. Provider/model terms and data handling must be reviewed by the operator before enabling this path.

The app's consent toggle is enforced by the normal UI flow, but it is not a production authorization boundary: consent is not stored as server-authoritative account state, and the API has no authentication. The current content endpoint should only be used with synthetic demo profiles. A production implementation must check server-side consent, enforce opt-out across every API and downstream delivery system, and minimize or avoid external prompt fields.

## Risks and mitigations to validate

- **Proxy and bias risk:** discount reliance, inactivity, geography/market, and engagement may reflect unequal access or circumstances. Do not use these demo scores to deny service, set prices, or make consequential eligibility decisions. Evaluate error and exposure differences across relevant groups before using real data.
- **Feedback-loop risk:** a small recommender/bandit can reinforce its own exposures. Production systems need exposure logging, holdouts, diversity constraints, exploration review, and a defined stop policy.
- **Over-messaging risk:** a predicted action can feel intrusive even when it has a high simulated score. Maintain contact limits, preference controls, and a human review path.
- **LLM risk:** prompts can be misunderstood or generate unsuitable marketing language. The assistant's factual product answer is server-rendered from validated source rows; marketing remains an unapproved draft.
- **Privacy risk:** real shopping questions can contain personal details. The interface advises against sharing them; operators should keep the LLM off for demos that might receive real user data.

## Compliance and production status

This project claims no legal certification, privacy compliance, security certification, or production readiness. Before launch, obtain jurisdiction-specific legal/privacy review, establish a lawful basis and clear notice/consent, define retention and deletion procedures, authenticate and authorize APIs, isolate tenants, protect stored data, assess vendors, and complete security and fairness testing. Federated learning is not implemented.
