# SmartSpend

A personal expense tracking app built with Next.js, Prisma, and PostgreSQL.

## Project structure

```
SmartSpend/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router (pages & API routes)
│   ├── components/
│   │   └── ui/          # Shared UI primitives (shadcn)
│   ├── lib/
│   │   ├── auth/        # NextAuth configuration
│   │   └── db/          # Prisma client
│   └── types/           # Shared TypeScript types
├── .env                 # Environment variables (not committed)
└── package.json
```

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Set up your `.env` file with a `DATABASE_URL` for PostgreSQL.

3. Generate the Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
