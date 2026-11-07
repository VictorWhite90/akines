"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { photoSrc } from "@/components/kin/home/parts";
import { useCollab } from "@/lib/collab/useCollab";
import { fileSize } from "@/lib/collab/proof";
import { initialsOf, nameOf, type FileComment, type ProjectFile } from "@/lib/collab/files";
import { useLocal } from "@/lib/useLocal";
import { PageHead, WorkspaceFrame } from "./Frame";
import { Card, Metric, Metrics } from "./blocks";
import { BackLink, CwLink, IconUpRight, Initials } from "./parts";
import { useProjectFiles } from "./Files";
import "../styles/files.css";
import "../styles/file.css";

/*
 * One file in the project workspace, mirrored from the product design (classes fp-* in ../styles/file.css and the
 * fl- preview and comments in files.css): size and comments, a preview, file information, the work it is
 * connected to, and the team's comments. Comments on studio items are the studio's own (useCollab).
 */

const longDay = (at: number) => new Date(at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).replace(",", "");
function when(at: number) {
  const d = new Date(at), today = new Date();
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?([ap])m/i, (_, a: string) => ` ${a.toUpperCase()}M`);
  const y = new Date(today); y.setDate(today.getDate() - 1);
  const day = d.toDateString() === today.toDateString() ? "Today" : d.toDateString() === y.toDateString() ? "Yesterday" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
  return `${day}, ${time}`;
}
/** Placeholder lines for a page we cannot show, as the design draws them (widths out of 276). */
const Lines = ({ w }: { w: number[] }) => <div className="fl-page__lines" aria-hidden>{w.map((x, i) => <i key={i} style={{ width: `${(x / 276) * 100}%` }} />)}</div>;

function Preview({ f, project }: { f: ProjectFile; project: string }) {
  const img = f.src ?? (f.photo ? photoSrc(f.photo, 720) : undefined);
  const label = f.size ? `${f.typeLong}, ${fileSize(f.size)}` : f.typeLong;
  if (img) {
    return (
      <div className="fl-panel" role="img" aria-label={`Preview of ${f.name}.`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the file itself */}
        <div className="fl-sheet fl-sheet--photo" aria-hidden><img src={img} alt="" decoding="async" /></div>
        <p className="fl-panel__label" aria-hidden>{label}</p>
      </div>
    );
  }
  return (
    <div className="fl-panel" role="img" aria-label={`Preview of ${f.name}. ${label}.`}>
      <div className="fl-sheet" aria-hidden>
        <p className="fl-sheet__eyebrow">{project.toUpperCase()}</p>
        <p className="fl-sheet__title">{f.name.replace(/\.[a-z0-9]+$/i, "")}</p>
        <i className="fl-sheet__rule" />
        <Lines w={[276, 262, 276, 240, 180]} />
        {f.text ? <p className="fl-sheet__question">{f.text}</p> : null}
        <Lines w={[276, 250, 276, 120]} />
      </div>
      <p className="fl-panel__label" aria-hidden>{label}</p>
    </div>
  );
}

function Comment({ c, onReply }: { c: FileComment; onReply: () => void }) {
  return (
    <li className="fl-msg">
      <Initials initials={initialsOf(c.by)} size={36} tone="muted" />
      <div className="fl-msg__body">
        <div className="fl-msg__head">
          <span className="fl-msg__who"><span className="fl-msg__name">{nameOf(c.by)}</span><span className="fl-msg__time">{when(c.at)}</span></span>
          <button type="button" className="fl-msg__reply" aria-label={`Reply to ${nameOf(c.by)}`} onClick={onReply}>Reply</button>
        </div>
        <p className="fl-msg__text">{c.text}</p>
      </div>
    </li>
  );
}

function Composer({ draft, onDraft, onSend }: { draft: string; onDraft: (v: string) => void; onSend: () => void }) {
  const field = useRef<HTMLTextAreaElement>(null);
  const ready = draft.trim().length > 0;
  useEffect(() => { const el = field.current; if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight + 2}px`; } }, [draft]);
  return (
    <form className="fl-composer" onSubmit={(e) => { e.preventDefault(); if (ready) { onSend(); field.current?.focus(); } }} noValidate>
      <textarea ref={field} className="fl-composer__field" rows={1} value={draft} placeholder="Add a comment." aria-label="Add a comment" onChange={(e) => onDraft(e.target.value)} />
      <div className="fl-composer__actions">
        <div className="fl-composer__refs"><CwLink>Attach file</CwLink><CwLink>Link task</CwLink><CwLink>Link decision</CwLink></div>
        <Button type="submit" variant={ready ? "primary" : "secondary"} disabled={!ready}>Send</Button>
      </div>
    </form>
  );
}

export default function FileView({ projectId, slug }: { projectId: string; slug: string }) {
  const { ws, get, comment } = useProjectFiles(projectId);
  const collab = useCollab();
  const [draft, setDraft] = useLocal(`ak:collab-file-draft:${projectId}/${slug}`, "");
  if (!ws.project) return null;
  const f = get(slug);
  const back = <BackLink href={ws.href("files")}>Back to files</BackLink>;
  if (!f) {
    return (
      <WorkspaceFrame projectId={projectId} active="files" rail="full" railHide={["file"]}>
        <div className="fp-page"><PageHead back={back} label="FILE" title="This file is not here." lead="It may have been removed from the project." /></div>
      </WorkspaceFrame>
    );
  }
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    if (f.source.kind === "studio") collab.project.comment(projectId, f.source.itemId, text);
    else comment(f.id, text);
    setDraft("");
  };
  const size = f.size ? fileSize(f.size).split(" ") : null;
  const isLink = f.icon === "link" || f.type === "Link";
  const download = () => toast.show({ message: "This file is not stored online yet, so it cannot be downloaded." });
  const info = [
    { label: "Type", value: f.typeLong },
    { label: "Added", value: longDay(f.at) },
    { label: "Shared by", value: nameOf(f.by) },
    { label: "Visible to", value: "Project team only" },
  ];

  return (
    <WorkspaceFrame projectId={projectId} active="files" rail="full" railHide={["file"]}>
      <div className="fp-page">
        <PageHead back={back} label="FILE" title={f.name} lead={f.about}>
          <div className="cw-actions cw-actions--btns">
            {f.url ? <Button href={f.url} target="_blank" rel="noreferrer">{isLink ? "Open link" : "Download"}</Button> : <Button onClick={download}>Download</Button>}
          </div>
        </PageHead>
        <Metrics>
          {size ? <Metric label="SIZE" value={size[0]} caption={`${size[1]}, ${f.typeLong}`} scrollTo="fp-info" /> : null}
          <Metric label="COMMENTS" value={f.comments.length} caption="from the team" dot scrollTo="fp-comments" />
        </Metrics>
        <section className="fp-sec" data-m="up"><h2 className="cw-over">PREVIEW</h2><Preview f={f} project={ws.project.title} /></section>
        <div className="fp-pair" id="fp-info">
          <Card title="FILE INFORMATION" className="fp-info">
            <ul className="fp-lines">{info.map((r) => <li className="fp-line" key={r.label}><div className="fp-line__in"><span className="fp-line__k">{r.label}</span><span className="fp-line__v">{r.value}</span></div></li>)}</ul>
          </Card>
          <Card title="CONNECTED WORK" className="fp-info">
            <ul className="fp-lines">
              <li className="fp-line">
                {f.work?.href ? (
                  <Link href={f.work.href} className="fp-line__in fp-line__in--link"><span className="fp-line__k">Related work</span><span className="fp-line__v">{f.work.text}<IconUpRight size={24} /></span></Link>
                ) : <div className="fp-line__in"><span className="fp-line__k">Related work</span><span className="fp-line__v">{f.work?.text ?? "Not linked yet"}</span></div>}
              </li>
              {f.milestone ? <li className="fp-line"><div className="fp-line__in"><span className="fp-line__k">Related milestone</span><span className="fp-line__v">{f.milestone.text}</span></div></li> : null}
            </ul>
          </Card>
        </div>
        <section className="fp-sec fp-anchor" id="fp-comments" data-m="up">
          <h2 className="cw-over">{`COMMENTS (${f.comments.length})`}</h2>
          <div className="fl-thread">
            {f.comments.length ? <ul className="fl-msgs" aria-label="Comments">{f.comments.map((c) => <Comment key={c.id} c={c} onReply={() => document.querySelector<HTMLTextAreaElement>(".fl-composer__field")?.focus()} />)}</ul> : null}
            <Composer draft={draft} onDraft={setDraft} onSend={send} />
          </div>
        </section>
      </div>
    </WorkspaceFrame>
  );
}
