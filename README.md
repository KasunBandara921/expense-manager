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

2. Copy `.env.example` to `.env` and fill in your values (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).

3. **Optional — AI recommendations:** Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey) and add it to `.env`:

```env
GEMINI_API_KEY="your-key-here"
```

The free tier is enough for personal use (rate limits apply). The key stays on the server and is never sent to the browser.

4. Generate the Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
