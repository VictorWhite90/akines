import Link from "next/link";

/** Step zero of "Start a KinCircle": a circle can be small or big. */
export default function SizeChooser() {
  return (
    <div className="kh cm-choose">
      <Link href="/circles" className="cm-back">← KinCircle</Link>
      <header>
        <p className="cm-over">Start a KinCircle</p>
        <h1>What kind of circle?</h1>
        <p>Circles come in two sizes. You can start small circles inside a community circle later.</p>
      </header>
      <div className="cm-sizes">
        <Link href="/circles/new?size=small" className="cm-size">
          <span className="cm-size-ic" aria-hidden>◎</span>
          <b>Small circle</b>
          <span className="cm-size-n">3 to 8 people</span>
          <p>A close group with one purpose and a few weeks together: a study group, a project, friends who meet every Sunday.</p>
          <span className="cm-size-go">Start a small circle →</span>
        </Link>
        <Link href="/circles/new?size=community" className="cm-size big">
          <span className="cm-size-ic" aria-hidden>◉</span>
          <b>Community circle</b>
          <span className="cm-size-n">Hundreds to thousands</span>
          <p>For clubs and organisations: leaders, members, events with tickets, an invite link and small circles inside.</p>
          <span className="cm-size-go">Start a community circle →</span>
        </Link>
      </div>
    </div>
  );
}
