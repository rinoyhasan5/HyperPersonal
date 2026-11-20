# Deployment

## Local demo

Install Node.js 18 or later and run:

```sh
npm start
```

By default, the service listens on `127.0.0.1:4173`. Configure `PORT` to change the port. No `.env` is required. The server initializes `data/demo-db.json`; keep that file on writable persistent storage if you need demo state to survive restarts. The app has no runtime dependency installation.

## Optional OpenAI integration

Copy `.env.example` to `.env` and set either `OPENAI_API_KEY` or `GEMINI_API_KEY` on the server only. `OPENAI_MODEL` and `GEMINI_MODEL` are optional. If both keys are set, OpenAI is used. Keep `.env` private; `.gitignore` excludes it. The demo uses deterministic fallbacks without a key or when a provider fails.

## Vercel deployment

The root `server.ts` is the Vercel Node server entry point. The browser bundle is named `client.js` so Vercel does not mistake the former root `app.js` frontend script for a server entry point. `vercel.json` includes the SPA assets in the server bundle. Import the repository in Vercel with the project root set to the repository root, Framework Preset set to **Other**, no build command, and no output directory. Redeploy after pushing these files. The server listens on Vercel's `PORT` and defaults to `0.0.0.0`.

The local JSON store remains unchanged for local `npm start`. In Vercel, it uses `/tmp/hyperpersonal-demo-db.json` because the deployment filesystem is read-only. `/tmp` is temporary and instance-local: server-side event history and bandit sync are suitable for a short demo session but are not durable across cold starts or shared across instances. Browser local storage retains the visitor's own state. Durable shared Vercel analytics require connecting a database or KV service and configuring its credentials; do not claim durable server persistence until that is implemented and verified.

Set `OPENAI_API_KEY` or `GEMINI_API_KEY` as a Vercel server-side environment variable only. Both are optional; deterministic local behavior works without them. Gemini offers a limited free tier for some models, subject to account eligibility and rate limits; free-tier submitted content may be used by Google to improve its products. Never put either key in a `NEXT_PUBLIC_*` variable or frontend file.

The owner supplied `https://hyper-personal.vercel.app`. Browser inspection returned `500 FUNCTION_INVOCATION_FAILED`; the Vercel request logs are not accessible from this workspace. After the Vercel entry point is committed and redeployed, verify the root page, `/api/health`, assistant fallback, and a write to `/api/events` in the live deployment. The app has no authentication or tenant isolation and remains a hackathon demo, not production-ready software.

For production, replace the JSON file store with a transactional database, add authentication/tenant isolation and server-side consent enforcement, review data retention and vendor handling, and add security headers, authorization, and audit controls. This demo is not production-ready.
