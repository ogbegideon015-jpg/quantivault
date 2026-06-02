# Quantivault — Construction Intelligence Platform

Real-time cost control, BOQ management, procurement, payments, site management, and AI-powered insights for construction firms.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v5
- **AI**: Anthropic Claude API
- **Payments**: Stripe
- **Email**: Resend
- **Cache**: Upstash Redis
- **Storage**: Cloudinary
- **Hosting**: Railway

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up database
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Owner**: gideon@demo.com / Demo@1234
- **QS**: chidi@demo.com / Demo@1234
- **Site Manager**: emeka@demo.com / Demo@1234
- **Finance**: ngozi@demo.com / Demo@1234

## Deployment (Railway)

1. Push to GitHub
2. Connect Railway to your GitHub repo
3. Add all environment variables from `.env.example`
4. Railway auto-deploys on every push

See `Quantivault-GoLive-Guide.docx` for the full step-by-step deployment guide.

## Project Structure
```
quantivault/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (dashboard)/     # All protected app pages
│   └── api/             # API routes
├── lib/                 # Shared utilities
├── prisma/              # Database schema & seed
├── auth.ts              # NextAuth configuration
└── middleware.ts        # Route protection
```
