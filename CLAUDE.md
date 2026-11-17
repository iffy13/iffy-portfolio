# Iffy Studio portfolio: instructions for Claude Code

Owner: Samuel Gansallo (call him Boss). Brand: "Iffy Studio". 400 Level Industrial Design student and builder of AI agents, automation, 3D, AI video, SaaS and web.

## Working style (strict)
- Call him Boss. Never use dash characters of any kind in replies to him (no em dashes, en dashes or hyphens as punctuation).
- Client or Fiverr message replies: give a professional version and a casual version. Never suggest phone or video calls.
- Do not ask questions he already answered. Take it step by step, discuss big changes before building.
- Priority is the scroll experience: a continuous, cinematic journey that is exciting but never busy. Mobile must be equally good.

## Site rules
- Email only samuel@iffystudio.site (the old Gmail must never appear). WhatsApp 2348075889359.
- No prices or delivery times yet. Do not show unconfirmed numbers (50+ projects, 30+ clients, 5+ years).
- Proof heading is "Skill you can see." Never use the word "promises".
- Loader is always black. Every page switch must start at the top.
- VoltX video is not used on the home page (blue and black clash, Gemini sparkle).
- Light mode must feel like a new, softer website with different scroll effects, not just inverted colours.
- Only use real reviews (data/reviews.json). He will add more later.

## Run and test
    python3 -m http.server 8000 --directory site   # open http://localhost:8000
    python3 tests/smoke_test.py      # needs playwright + chromium

See docs/HANDOFF.md for architecture and the TODO list.
Layout: all web files live in site/ (Netlify publishes only that folder). Docs, tests, data and notes sit beside it and are never published.
