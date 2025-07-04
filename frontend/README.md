This package contains the Next.js front‑end for the TalentScout dashboards. It was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies and run the development server:

```bash
npm install
```

Then start the dev server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Offline Demo

Copy `.env.local.example` to `.env.local` and leave `NEXT_PUBLIC_API_URL` unset to use the built‑in mock API:

```bash
cp .env.local.example .env.local
npm run demo
```

The `demo` script starts the dev server with mock data so you can explore the recruiter and athlete views without running a backend.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Recruiter Dashboard

The recruiter view now shows athlete cards in a responsive grid instead of a swipe deck. It works like an Instagram feed so you can browse multiple profiles at once.

![Recruiter dashboard screenshot](docs/recruiter-dashboard-grid.png)

The `swiper` package is still installed but now only powers the testimonial slider on the landing page.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
