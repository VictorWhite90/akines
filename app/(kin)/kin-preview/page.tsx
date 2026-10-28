"use client";

import { useState } from "react";
import { Add, ArrowRight2, Export, Heart, Message, Notification, SearchNormal1 } from "iconsax-reactjs";
import Avatar, { Faces, Tie } from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Media } from "@/components/kin/Card";
import Settle from "@/components/kin/Settle";
import Sheet from "@/components/kin/Sheet";
import { Segmented, TabPanel, Tabs } from "@/components/kin/Tabs";
import ThemeToggle from "@/components/kin/ThemeToggle";
import { PEOPLE } from "@/lib/data/people";
import CallCard from "./CallCard";
import { CALLS } from "./_sample";
import "./preview.css";

const SW = [
  ["brand", "Primary fill, active indicator, live ring"], ["brand-text", "Links, active icon, the tie"], ["brand-soft", "Hover tint"],
  ["canvas", "The page"], ["surface", "Inputs, chips, controls"], ["raised", "Sheets, menus"],
  ["ink", "Headings, names, body"], ["ink-2", "Descriptions"], ["ink-3", "Meta, placeholders"],
  ["line", "Input borders"], ["success", "Approved, paid"], ["danger", "Destructive, errors"],
] as const;

export default function KinPreview() {
  const [tab, setTab] = useState<"calls" | "projects" | "ideas" | "hosting">("calls");
  const [scope, setScope] = useState<"you" | "all">("you");
  const [tied, setTied] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [liked, setLiked] = useState(false);
  const ayo = PEOPLE.ayo, amara = PEOPLE.amara, wanjiru = PEOPLE.wanjiru;

  return (
    <div className="pv">
      <Settle className="pv-head">
        <p className="t-small c-3">Kin system · specimen</p>
        <h1 className="t-page">One amber, warm paper, warm night.</h1>
        <p className="t-body c-2 pv-prose">Everything on this page is built from the tokens and base components the three redesigned pages will use. Switch the theme with the toggle to judge both. Nothing here is a final layout.</p>
        <div className="pv-row"><ThemeToggle label /></div>
      </Settle>

      <section className="pv-sec" aria-labelledby="pv-colour">
        <h2 id="pv-colour" className="t-title">Colour</h2>
        <div className="pv-swatches">
          {SW.map(([t, use]) => <div key={t} className="pv-sw"><i style={{ background: `var(--${t})` }} /><b className="t-micro">{t}</b><span className="t-small c-3">{use}</span></div>)}
        </div>
      </section>

      <section className="pv-sec" aria-labelledby="pv-type">
        <h2 id="pv-type" className="t-title">Type</h2>
        <div className="pv-type">
          <div><small>display 56</small><span className="t-display">Find your people.</span></div>
          <div><small>display-2 40</small><span className="t-display2">Every gathering has a purpose.</span></div>
          <div><small>page 32</small><span className="t-page">Collaborate</span></div>
          <div><small>title 22</small><span className="t-title">Open calls</span></div>
          <div><small>heading 17</small><span className="t-heading">Jabi Lake Arts Week: a 20‑metre mural</span></div>
          <div><small>body 15</small><span className="t-body">Twelve-hour shift done, and a patient&apos;s daughter brought the whole ward jollof. Ẹ ṣeun, Ìbàdàn.</span></div>
          <div><small>small 13</small><span className="t-small c-3">Nurse · Ibadan · 2h</span></div>
          <div><small>micro 12</small><span className="t-micro">4 WAITING</span></div>
        </div>
      </section>

      <section className="pv-sec" aria-labelledby="pv-btn">
        <h2 id="pv-btn" className="t-title">Buttons and links</h2>
        <div className="pv-row">
          <Button variant="primary"><Add size={18} color="currentColor" />Post a call</Button>
          <Button>Propose a project</Button>
          <Button variant="ghost">See all</Button>
          <Button variant="danger">Withdraw</Button>
          <Button variant="primary" size="sm">Apply</Button>
          <Button size="sm">Pass</Button>
          <Button variant="ghost" icon aria-label="Notifications"><Notification size={20} color="currentColor" /></Button>
          <Button variant="primary" disabled>Sending…</Button>
        </div>
        <div className="pv-grid">
          <div className="pv-opt"><b className="t-micro c-3">OPTION A · AMBER LINKS</b><p className="t-body pv-prose">Links in running text use the deeper amber: <a href="#pv-btn">edit your work profile</a>, or <a href="#pv-btn">see all calls</a>. The same tone marks the active icon and the tie.</p></div>
          <div className="pv-opt"><b className="t-micro c-3">OPTION B · INK LINKS</b><p className="t-body pv-prose alt">Links in running text are ink with an underline: <a href="#pv-btn">edit your work profile</a>, or <a href="#pv-btn">see all calls</a>. Amber is kept for the active icon and the tie only.</p></div>
        </div>
        <label className="k-search" style={{ maxWidth: 420 }}><SearchNormal1 size={18} color="currentColor" /><input placeholder="Search calls, roles, organisations" aria-label="Search" /></label>
      </section>

      <section className="pv-sec" aria-labelledby="pv-tabs">
        <h2 id="pv-tabs" className="t-title">Tabs and segmented control</h2>
        <Tabs label="Collaborate sections" value={tab} onChange={setTab} items={[{ id: "calls", label: "Calls", count: 6 }, { id: "projects", label: "Projects", count: 5 }, { id: "ideas", label: "Ideas", count: 3 }, { id: "hosting", label: "Hosting", count: 1 }]}>
          <TabPanel value="calls"><p className="t-body c-2" style={{ paddingTop: 16 }}>The amber indicator slides between tabs on a spring.</p></TabPanel>
          <TabPanel value="projects"><p className="t-body c-2" style={{ paddingTop: 16 }}>Projects you are part of, newest first.</p></TabPanel>
          <TabPanel value="ideas"><p className="t-body c-2" style={{ paddingTop: 16 }}>Ideas sent to you and ideas you sent.</p></TabPanel>
          <TabPanel value="hosting"><p className="t-body c-2" style={{ paddingTop: 16 }}>Calls you host and who applied.</p></TabPanel>
        </Tabs>
        <Segmented label="Which calls" value={scope} onChange={setScope} items={[{ id: "you", label: "For you" }, { id: "all", label: "All calls" }]} />
      </section>

      <section className="pv-sec" aria-labelledby="pv-people">
        <h2 id="pv-people" className="t-title">People: live ring, the tie, a team</h2>
        <div className="pv-ties">
          <div className="pv-tie"><Avatar person={ayo} size={48} live /><Avatar person={amara} size={48} /><Avatar person={{ name: "Chidi Eze" }} size={48} /><p className="t-small c-2">Live is amber: the one ambient motion, a slow breath.</p></div>
          <div className="pv-tie"><Tie a={amara} b={wanjiru} size={44} dotted={!tied} draw={tied} /><p className="t-small c-2">An idea: dotted until the other person says yes.</p><Button size="sm" onClick={() => setTied((t) => !t)}>{tied ? "Reset" : "Wanjiru says yes"}</Button></div>
          <div className="pv-tie"><Faces people={[amara, PEOPLE.kwame, PEOPLE.fatou, PEOPLE.tunde, ayo]} size={32} /><p className="t-small c-2">A team. The tie appears only on ideas, matches, teams and new connections.</p></div>
        </div>
      </section>

      <section className="pv-sec" aria-labelledby="pv-feed">
        <h2 id="pv-feed" className="t-title">A feed item</h2>
        <div className="pv-feed">
          {[0, 1].map((i) => (
            <Settle key={i} index={i}>
              <article className="k-post">
                <Avatar person={i ? PEOPLE.leila : ayo} size={40} live={i === 0} />
                <div style={{ minWidth: 0 }}>
                  <div className="k-post-head"><b>{i ? leilaName() : ayo.name}</b><span>· {i ? "Book Club" : "New in the City"} · {i ? "5d" : "2h"}</span></div>
                  <p className="k-post-body t-body">{i ? "Should a friend ever ask you to lend them money twice? I said no for years. A conversation last week made me less sure." : "Twelve-hour shift done, and a patient's daughter brought the whole ward jollof. Some days this job gives back more than it takes."}</p>
                  {i === 0 && <Media photo="photoAlbum" ratio="4 / 3" className="k-post-media" sizes="(max-width: 639px) 100vw, 600px" />}
                  <div className="k-post-acts">
                    <button type="button"><Message size={18} color="currentColor" />{i ? 2 : 3}</button>
                    <button type="button" onClick={() => setLiked((l) => !l)} aria-pressed={liked && i === 0} style={liked && i === 0 ? { color: "var(--brand-text)" } : undefined}><Heart size={18} color="currentColor" variant={liked && i === 0 ? "Bold" : "Linear"} />{(i ? 1 : 5) + (liked && i === 0 ? 1 : 0)}</button>
                    <button type="button"><Export size={18} color="currentColor" /></button>
                  </div>
                </div>
              </article>
            </Settle>
          ))}
        </div>
      </section>

      <section className="pv-sec" aria-labelledby="pv-call">
        <h2 id="pv-call" className="t-title">A call card, and the shared-element move</h2>
        <p className="t-body c-2 pv-prose">Open a card: its photo moves into place as the hero of the detail page. Back does the reverse.</p>
        <div className="pv-grid">{CALLS.map((c, i) => <Settle key={c.id} index={i}><CallCard call={c} /></Settle>)}</div>
      </section>

      <section className="pv-sec" aria-labelledby="pv-sheet">
        <h2 id="pv-sheet" className="t-title">Sheet</h2>
        <div className="pv-row"><Button onClick={() => setSheet(true)}>Propose a project<ArrowRight2 size={16} color="currentColor" /></Button></div>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="Propose a project to Wanjiru" sub="Wanjiru sees your idea and the roles. If they say yes, you get a shared project.">
          <form className="k-stack" onSubmit={(e) => { e.preventDefault(); setSheet(false); }}>
            <div className="k-field"><label htmlFor="pv-t">Working title</label><input id="pv-t" className="k-input" defaultValue="New in Abuja, a photo zine" /></div>
            <div className="k-field"><label htmlFor="pv-i">The idea</label><textarea id="pv-i" className="k-input" defaultValue="A 16-page zine of people who moved to Abuja in the last year: one portrait, one sentence each." /></div>
            <Button variant="primary" type="submit" block>Send the proposal</Button>
          </form>
        </Sheet>
      </section>
    </div>
  );
}

function leilaName() { return PEOPLE.leila.name; }
