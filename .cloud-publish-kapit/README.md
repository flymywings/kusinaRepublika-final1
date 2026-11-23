# Kapit Design Build

Interactive React prototype for Kapit, a verified LPU Cavite community-help experience. The project pairs 10 editable Kapit mockups with 10 preserved Uber source-reference screens.

## Prototype

Kapit screens cover landing, how-it-works onboarding, role choice, LPU verification, nearby requests, request details, coordination, completion and review, Ask Kapit, and AI match results.

Primary interactions include the onboarding journey, persisted Caller or Runner role, request details, protected coordination state, review return to Home, source-gallery inspector, and keyboard navigation. Ask Kapit uses local deterministic states only: prompt, processing, request draft, and match results.

No backend or real authentication, messaging, maps, location tracking, payments, or live AI is included. Precise locations and contact details stay hidden until agreement.

## Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3010`.

```bash
pnpm build
```
