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

### Using MongoDB Atlas

You can host MongoDB in the cloud with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas):

1. Create a free account and deploy a **Shared** cluster.
2. In **Database Access**, create a user and password.
3. In **Network Access**, allow your IP address.
4. From **Connect** → **Connect Your Application**, copy the connection string.
5. Update `server/.env` so `MONGO_URI` points at your Atlas URL, e.g.

   ```
   MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/talentscout?retryWrites=true&w=majority
   ```

Start the API server after saving the file and ensure the frontend's
`NEXT_PUBLIC_API_URL` points at the server.

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

The server also exposes a Socket.IO endpoint at `ws://localhost:3001/socket.io` which powers the real-time chat features. Clients should connect with this URL when `NEXT_PUBLIC_API_URL` is set in the frontend environment.



To try the dashboards without a backend, you can run the frontends in mock mode by commenting out `NEXT_PUBLIC_API_URL` in the environment file:

```bash
cd frontend
cp .env.local.example .env.local
# comment NEXT_PUBLIC_API_URL in .env.local to enable mock data
npm run demo
```

The older `web` package also supports mock API routes. Comment the variable in `.env` before starting the dev server:

```bash
cd web
cp .env.example .env
# comment NEXT_PUBLIC_API_URL in .env to enable mock data
npm run dev
```

### Running Tests

```bash
npm test
```

This executes the baseline script which runs unit tests for each package and writes `BASELINE_REPORT.md`.

### Docker Compose
The compose file now starts MongoDB, the API server and the Next.js frontend.
Copy the example environment files and then launch all services:

```bash
cp web/.env.example web/.env
cp server/.env.example server/.env
docker compose up --build
```

Environment variables for MongoDB, JWT signing and optional AWS credentials are
passed to the `server` container. The `web` service receives
`NEXT_PUBLIC_API_URL` pointing at the API so requests from the browser resolve
to the correct container.

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
