## Mandela Prop

This is a Next.js + Supabase app. The **admin dashboard will not talk to the database unless Supabase env vars are set**.

## Supabase setup (fresh, reliable)

- **Create a Supabase project**
  - Supabase Dashboard → New project
- **Apply the database schema**
  - Supabase Dashboard → SQL Editor → run `supabase/schema.sql`
- **Create your staff account**
  - Run the app, go to `/signup`, create your account (verify email if your project requires it)
- **Promote yourself to admin**
  - Supabase Dashboard → SQL Editor → run `supabase/bootstrap_admin.sql` (edit the email inside first)
- **Set env vars locally**
  - Copy `.env.local.example` → `.env.local`
  - Fill in:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Quick connection test

- Start the app and open `http://localhost:3000/api/health/supabase`
  - `ok: true` means the app can reach Supabase.
  - If `configured: false`, your `.env.local` is missing/incorrect.

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
