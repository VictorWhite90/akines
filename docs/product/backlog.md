# Akines product backlog

_Last updated: 2026-10-17. Ideas and tasks to come back to, in rough priority order._

## In progress

### Broaden sample content beyond the art world
- [x] Part 1: people, circles, rooms, Cliqs, Banters, Banter Now, home feed, introductions, KinMessage
- [x] Part 2a: older feed posts, game copy, feed photos
- [x] Circle chat, circle activities, comments
- [ ] Stories and journals
- [ ] Studio, Store, Shop: reframe for any maker or professional ("My space", "Marketplace")
- [ ] Small copy: Create a room form, Companion, Wellbeing

## Next up

### Events (new feature)
People can create and join events, online or in person.
- Create an event: title, purpose, date and time, place or link, capacity, who can see it (Cliq, KinCircle, public)
- RSVP (going / maybe), with the reason you were invited, like Play Together invitations
- Event page: who's going, a small pre-event chat, reminders
- After the event: reflection, shared photos and memories, "do this again", turn it into a KinCircle
- Links: add "Event" to the Create menu; show upcoming events on Home and in "Happening now"
- Backend: Event, RSVP, reminder jobs (Celery and Redis); calendar export (.ics)

### More games in Play Together
Add games that are trending among friends, keeping Akines' safeguards (skip, pause, consent, no humiliation).
- **Voice games:** guess the voice or song snippet (original or licensed only), voice-note riddles, story relay by voice
- **Truth or Dare:** a kind, consent-first version (people choose their comfort level; dares are never humiliating or unsafe; skipping is always free)
- **Party classics:** Never Have I Ever, Would You Rather, Hot Takes, This or That, Most Likely To (exists)
- **Word and quiz:** Charades or Pictionary (draw on a shared canvas), trivia nights (music, football, Nollywood, general knowledge), riddles, guess the emoji
- **Real-time:** quick-draw, word chains, "finish my sentence"
- **Friendship:** "How well do you know me?" quizzes, two-player compatibility games
- Needs: real-time game sessions (WebSockets), voice (LiveKit/Agora), a shared drawing canvas, scoring kept private or off by default

### Home feed tabs
See `feed-strategy.md`: Your people, Discover, Topics, Live, Highlights.

## Later
- Phone pass on every page; installable web app (PWA)
- Clean-up: remove experiments (Constellation, The Weekly, atelier screens, /layouts, _legacy) and duplicate data models
- Backend groundwork: domain map, database design (PostgreSQL and Redis), OpenAPI contract, frontend data layer behind hooks
- Django backend; real-time chat and voice
- Mobile app (React Native/Expo) sharing the API types
