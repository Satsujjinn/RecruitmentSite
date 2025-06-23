# TalentScout

This repository mirrors the basic structure of **TalentSite**. The monorepo contains multiple packages:

- **client/** – static HTML forms for manual testing
- **web/** – Next.js application
- **server/** – Express backend with MongoDB and AWS S3

## Getting Started

### Setup

```bash
cp web/.env.example web/.env
cp server/.env.example server/.env
npm install --workspaces
```

Edit both `.env` files and provide values for `JWT_SECRET`, `MONGO_URI` and
the optional AWS settings if you plan to upload avatars.

Use **Node.js 18** when installing dependencies. Newer Node versions may fail to
load the `lightningcss` binary that Next.js depends on.
If you see an error like `Cannot find module '../lightningcss.darwin-arm64.node'`,
switch to Node 18 and reinstall packages.

### Running Locally

```bash
npm run dev
npm --workspace server run dev
```

Start MongoDB and run these commands in separate terminals. The Next.js app
listens on <http://localhost:3000> while the API server runs on port 3001.



To try the dashboards without a backend, use the `frontend` package which ships with mock data:

```bash
cd frontend
cp .env.local.example .env.local
npm run demo
```

The older `web` package now also supports mock API routes. Copy the example env file, leave `NEXT_PUBLIC_API_URL` empty and run the dev server:

```bash
cd web
cp .env.example .env
npm run dev
```

### Running Tests

```bash
npm test
```

This executes the baseline script which runs unit tests for each package and writes `BASELINE_REPORT.md`.

### Docker Compose

A simple `docker-compose.yml` is provided to run the Next.js app in a container.

## Deployment

Deploy the Next.js app with Vercel or any Node hosting. Remember to set the environment variables shown in the `.env.example` file.

## Production Setup

Before building for production, copy the example environment files and add your
production secrets:

```bash
cp web/.env.example web/.env
# copy server environment as well
cp server/.env.example server/.env
# edit this file with real values
```

Run the full test suite and ensure it passes:

```bash
npm test
```

Once tests succeed, build the project:

```bash
npm run build
```

You can then launch the application in Docker:

```bash
docker compose up --build
```

Tests must pass and all secrets must be configured for the container to run
correctly.
