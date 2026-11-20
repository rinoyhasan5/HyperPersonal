# Deployment

## Local demo

Install Node.js 18 or later and run:

```sh
npm start
```

By default, the service listens on `127.0.0.1:4173`. Configure `PORT` to change the port. No `.env` is required. The server initializes `data/demo-db.json`; keep that file on writable persistent storage if you need demo state to survive restarts. The app has no runtime dependency installation.

## Optional OpenAI integration

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` on the server only. `OPENAI_MODEL` is optional. Keep `.env` private; `.gitignore` excludes it. The demo uses deterministic fallbacks without a key or when the provider fails.

## Hosting status and compatible option

No hosting configuration, deployment URL, Git remote, or deployment credentials are present in this workspace. The application is not deployed. The least invasive compatible hosting shape is a Node.js web service that runs `npm start`, supplies `PORT`, sets `HOST=0.0.0.0`, and mounts writable persistent storage for the JSON file. Static-only hosting cannot provide the complete API/persistence workflow. This workspace does not select a provider or claim a deployment; secure the service before public exposure because the demo has no authentication or tenant isolation.

For production, replace the JSON file store with a transactional database, add authentication/tenant isolation and server-side consent enforcement, review data retention and vendor handling, and add security headers, authorization, and audit controls. This demo is not production-ready.
