# Artelia Connect — UI prototype

A vibe-coded, clickable UI prototype of **Artelia Connect**: the community and
collaboration layer of Artelia described in the *Artelia Connect Concept Note*
(September 2026). Mock data only — no backend.

Artelia has three pillars: **Discover** (the marketplace at artelia.art),
**Connect** (human community) and **Create** (collaboration & opportunity).
This prototype builds Connect and Create.

## Run it

```bash
yarn install
yarn dev        # http://localhost:3100
```

## The idea: the Village

Connect is laid out like a community app — think an advanced Discord, with its
own soul, after the concept note's "living African creative village":

- **A rail of spaces**: your Circles, the Collaboration Studio, Opportunities, the Gallery.
- **Channels inside each circle** — #welcome, #general, #works-in-progress, #opportunities.
- **Palavers**: Presence Rooms as six seats around a fire. No audience, not recorded.
- **Creative presence** instead of online/offline: *In the studio · dyeing panel 7*, *In a room*, *Quiet mode*.
- **Introductions become DMs** with the reason for the match pinned at the top.
- **Structured critique** replies: what's working, what's unclear, try this.
- **Responses show who, never how many** — no likes, no follower counts.
- **The Companion** is a labelled AI member of every space.

## Start here

- **`/concept`** — every requirement from the concept note mapped to the screen
  that satisfies it, plus click-through walkthroughs of the six use cases.
- **`/`** — *Today*: purpose-first, finite, never a feed.

## Where things live

| Path | What |
| --- | --- |
| `docs/concept-requirements.md` | The concept note as a numbered checklist (P, C, S, W, T, B, M, U). Page files cite the IDs they cover. |
| `app/**` | One folder per route. |
| `components/ui/` | Shared kit: Button, Card, Badge, **TrustLabel** (verified / self-declared / AI), Avatar, Tabs, StageTracker, Spectrum, Notice, Media… |
| `components/shell/` | App shell: pillars, grouped sidebar, mobile tab bar. |
| `lib/types.ts`, `lib/data/` | Domain model and mock data. The signed-in member is Adaeze Nwosu, a textile artist in Lagos. |

## Principles the UI holds to

- No follower counts, like counts or infinite feeds.
- Every AI suggestion is labelled and explains itself; verified facts, self-declared
  information and AI recommendations are always visually distinct.
- Wellbeing is private by default and never feeds matching, ranking or advertising.
- People are fictional. Imagery is Artelia's own studio and material photography —
  no real artists' works are attributed to invented profiles.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, iconsax-reactjs.
