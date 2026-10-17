# Akines feed strategy

_Status: proposed (2026-10-17). Not built yet. Revisit before redesigning Home._

## The concern

A feed that runs dry makes an app feel empty, and empty apps get abandoned. Akines risks this because:

- Small Cliqs and KinCircles produce fewer posts than following hundreds of accounts.
- New users have no circles yet (the "empty room" problem).
- Banters expire on purpose, so content disappears.

The fix is not to copy endless feeds (that breaks the "less scrolling, more belonging" promise). It is to make sure there is always something **meaningful** to see.

## Proposal: several feeds, each with a purpose

1. **Your people:** posts and Banters from your Cliqs and KinCircles. The core feed; always first.
2. **Discover ("Around you"):** public Banters, open rooms and posts from circles you could join, chosen by interests and city. Endless, but every item is an invitation to join something.
3. **Topics:** Tech, Money, Parenting, Football, Faith, Food and so on. People follow topics, not influencers.
4. **Live now:** rooms, Banter Now and game nights happening this minute. A real-time pulse and a reason to open the app.
5. **Highlights:** the best Banters that grew into KinCircles or projects ("this question started a coding club"). Shows what Akines is for.

## Two rules that keep it Akines

- **Every item leads to people.** Each post offers a way to join, reply, take a seat or say hello, not just a like.
- **Honest endings.** "You're all caught up with your people" comes first, then "Want to explore beyond your circles?" Infinite scroll is opt-in, on Discover only.

## New users

Seed Home with Topics and Live now, based on the interests chosen at sign-up, so day one is never empty.

## Prototype implementation (when we pick this up)

- Tabs on the Home feed: **Your people · Discover · Topics · Live**.
- Fill Discover and Topics with broader sample content (depends on part 2 of the content broadening).
- Keep the existing infinite load, but only on Discover.

## Backend notes (Django)

- Feed sources: memberships (Cliq, KinCircle), topic follows, location, and live sessions.
- Ranking should favour reciprocity and invitations to connect, never raw engagement.
- Cache per-user "Your people" feeds in Redis; compute Discover from interests and city.
