# Guatemala Trip Planner

5-day Antigua → Acatenango → Lake Atitlán app with Today mode, Explore, AI chat, deal hunter, wallet, map, and Spanish phrases.

## Deploy to Vercel (share with friends)

1. Push this folder to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add **Environment Variables** (Production):
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com/)
   - `TAVILY_API_KEY` — optional, for live deal web search ([tavily.com](https://tavily.com))
4. Deploy → share the URL (e.g. `https://your-trip.vercel.app`)

Friends open the link on their phone → **Share → Add to Home Screen** for app-like experience.

### Protect your $5 budget

1. **Anthropic Console** → Billing → set **hard spending limit $5** (this is the real enforcement)
2. App shows a **$5 budget meter** per device (estimate from token usage)
3. Use `ANTHROPIC_MODEL=claude-haiku-4-5-20251001` for cheaper chat

**Important:** Everyone using your link shares one API key. The Anthropic spending limit protects you globally; the in-app meter is per-browser.

## AI features

| Feature | What it does |
|---------|----------------|
| **Chat** | Context-aware — knows trip day, weather °F, wallet bookings |
| **Deals** | After you set trip dates, scans where to book cheap (web search if Tavily key set) |

API key stays **server-side** on Vercel — not in the phone app bundle.

## Local dev

```bash
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Offline (no AI)

Itinerary, Today, Explore, Map, Wallet, Español work without API keys. AI needs deployed `/api/*` routes.

## Deal search note

We use **web search API** (Tavily) + Claude — not scraping booking sites directly (they block scrapers and break often). Claude synthesizes results into actionable booking advice.
