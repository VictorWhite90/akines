"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Image as ImageIcon, Layers, Link2, NotebookText, Search, Shapes, Upload, X } from "lucide-react";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Empty, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { fileSize } from "@/lib/collab/proof";
import { workHref } from "@/lib/collab/conversations";
import { FILE_CATEGORIES, fileMeta, initialsOf, useFiles, type FileCategory, type FileIcon, type FileLink, type ProjectFile } from "@/lib/collab/files";
import { useWorkspace } from "@/lib/collab/workspace";
import type { Deliverable, Project } from "@/lib/collab/types";
import { PageHead, WorkspaceFrame } from "./Frame";
import { CwLink, IconCheck } from "./parts";
import "../styles/files.css";

/*
 * The project workspace's Files page, mirrored from the product design (classes fl-* in ../styles/files.css):
 * search, categories, every file with the work and milestone it supports, and the upload and new-document
 * dialogs. Files come from the project's studio and deliverable proof, plus what the team adds (lib/collab/files).
 *
 * Search and categories (design 12.19 and 12.37: Search focused, Search results, Filtered: <category>, No results).
 * The list shows all files, the results of a search, or one category. Typing alone keeps the whole list; Enter or
 * the search icon shows the results; Clear, All or emptying the field go back. A category is one choice at a time,
 * clears the search, and choosing it again goes back to All.
 */

const ICONS: Record<FileIcon, typeof FileText> = { text: FileText, image: ImageIcon, notes: NotebookText, shapes: Shapes, layers: Layers, link: Link2 };
const TOAST_MS = 2500;
const filled = (v: string) => (v.trim() ? "fl-filled" : undefined);

export function FileTile({ icon, className }: { icon: FileIcon; className?: string }) {
  const I = ICONS[icon];
  return <span className={className ? `fl-tile ${className}` : "fl-tile"} aria-hidden><I size={22} strokeWidth={1.5} focusable={false} /></span>;
}

/** The address of a file's page. */
export const fileHref = (projectId: string, f: ProjectFile) => `/collaborate/my-projects/${projectId}/files/${f.slug}`;
/** The deliverable links of a project's files go to the Tasks page. */
export function useProjectFiles(projectId: string) {
  const ws = useWorkspace(projectId);
  const toWork = useCallback((d: Deliverable) => workHref(projectId, d), [projectId]);
  return { ws, ...useFiles(ws.project, toWork) };
}

function Rel({ link }: { link: FileLink }) {
  return link.href ? <Link href={link.href} className="fl-rel__link">{link.text}</Link> : <span className="fl-rel__link">{link.text}</span>;
}

function FileRow({ f, href }: { f: ProjectFile; href: string }) {
  return (
    <div className="fl-row">
      <FileTile icon={f.icon} />
      <div className="fl-row__content">
        <h3 className="fl-row__title"><Link href={href} className="fl-row__main">{f.name}</Link></h3>
        <p className="fl-row__meta">{fileMeta(f)}</p>
        {f.work || f.milestone ? (
          <p className="fl-row__related">
            {f.work ? <span className="fl-rel"><span className="fl-rel__label">Work</span><Rel link={f.work} /></span> : null}
            {f.milestone ? <span className="fl-rel"><span className="fl-rel__label">Milestone</span><Rel link={f.milestone} /></span> : null}
          </p>
        ) : null}
      </div>
      <span className="fl-owner" aria-hidden>{initialsOf(f.by)}</span>
    </div>
  );
}

/** What the team is working on now, to suggest the work and milestone a new file supports. */
const openWork = (p: Project) => (p.deliverables ?? []).find((d) => d.status !== "approved")?.title ?? p.tasks.find((t) => t.status !== "done")?.title ?? "";
const openMilestone = (p: Project) => p.milestones.find((m) => !m.done)?.title ?? "";
const categoryOf = (name: string): FileCategory => {
  const e = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(e)) return "Images";
  if (["fig", "psd", "sketch", "ai", "xd"].includes(e)) return "Design files";
  if (["ppt", "pptx", "key"].includes(e)) return "Presentations";
  if (["pdf", "doc", "docx", "txt", "md"].includes(e)) return "Documents";
  if (["csv", "xls", "xlsx"].includes(e)) return "Research";
  return "Other materials";
};

function DropZone({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const over = (e: React.DragEvent) => e.preventDefault();
  const drop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
  const pick = <input ref={input} type="file" hidden tabIndex={-1} aria-hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />;
  if (file) {
    const meta = `${file.name.split(".").pop()?.toUpperCase() ?? "File"}, ${fileSize(file.size)}`;
    return (
      <>
        <button type="button" className="fl-drop fl-drop--chosen" onClick={() => input.current?.click()} onDragOver={over} onDrop={drop} aria-label={`${file.name}, ${meta}. Choose a different file`}>
          <FileTile icon="text" />
          <span className="fl-drop__text"><span className="fl-drop__name">{file.name}</span><span className="fl-drop__meta">{meta}</span></span>
          <span className="fl-drop__change">Choose a different file</span>
        </button>
        {pick}
      </>
    );
  }
  return (
    <>
      <button type="button" className="fl-drop" onClick={() => input.current?.click()} onDragOver={over} onDrop={drop}>
        <span className="fl-drop__icon" aria-hidden><Upload size={20} strokeWidth={1.5} focusable={false} /></span>
        <span className="fl-drop__title">Choose a file</span>
        <span className="fl-drop__copy">or drag it here. PDF, Word, images, design files and presentations.</span>
      </button>
      {pick}
    </>
  );
}

function UploadModal({ open, project, onClose, onUpload }: { open: boolean; project: Project; onClose: () => void; onUpload: (v: { file: File; work: string; milestone: string }) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [work, setWork] = useState(""), [milestone, setMilestone] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh form each time it opens
    setFile(null); setWork(openWork(project)); setMilestone(openMilestone(project)); setError("");
  }, [open, project]);
  const submit = (e?: React.FormEvent) => { e?.preventDefault(); if (!file) { setError("Choose a file first."); return; } onUpload({ file, work, milestone }); };
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="UPLOAD FILE" title="Add a file to the project." description="Choose a file and say which work it supports." footer={<><Button type="submit" form="fl-upload-form">Upload</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="fl-upload-form" className="cw-form" onSubmit={submit} noValidate>
        <Field error={error || undefined}><div><DropZone file={file} onFile={(f) => { setFile(f); setError(""); }} /></div></Field>
        <Field label="Related work" hint="The work this file supports."><Input className={filled(work)} value={work} onChange={(e) => setWork(e.target.value)} /></Field>
        <Field label="Related milestone" hint="The milestone it belongs to."><Input className={filled(milestone)} value={milestone} onChange={(e) => setMilestone(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

function CreateModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (v: { title: string; category: FileCategory }) => void }) {
  const [title, setTitle] = useState(""), [category, setCategory] = useState("Documents");
  const [error, setError] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh form each time it opens
  useEffect(() => { if (open) { setTitle(""); setCategory("Documents"); setError(""); } }, [open]);
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) { setError("Give the document a title."); return; }
    const c = (FILE_CATEGORIES.find((x) => x !== "All" && x.toLowerCase() === category.trim().toLowerCase()) ?? "Documents") as FileCategory;
    onCreate({ title: title.trim(), category: c });
  };
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="NEW DOCUMENT" title="Start a shared document." description="Give it a title and say where it belongs." footer={<><Button type="submit" form="fl-create-form">Create document</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="fl-create-form" className="cw-form" onSubmit={submit} noValidate>
        <Field label="Document title" hint="A short, clear name." error={error || undefined}><Input className={filled(title)} value={title} placeholder="For example, Research summary" onChange={(e) => { setTitle(e.target.value); setError(""); }} /></Field>
        <Field label="Category" hint="Where your team will find it."><Input className={filled(category)} value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

function Categories({ isOn, onPick }: { isOn: (c: string) => boolean; onPick: (c: string) => void }) {
  return (
    <div className="fl-cats" role="group" aria-label="Categories">
      {FILE_CATEGORIES.map((c) => {
        const on = isOn(c);
        return <button key={c} type="button" className="fl-cat" aria-pressed={on} onClick={() => onPick(c)}>{on ? <IconCheck size={14} sw={1.6} /> : null}<span>{c}</span></button>;
      })}
    </div>
  );
}

/** Search files: the search icon, the value and Clear (a 32 px cross, shown once something is typed). */
function SearchField({ value, onChange, onSubmit, onClear }: { value: string; onChange: (v: string) => void; onSubmit: () => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const has = value.length > 0;
  return (
    <form className="fl-search" role="search" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <Input
        ref={input}
        className={has ? "fl-filled" : undefined}
        // the icon is the second way to search (Enter is the first), so it stays out of the tab order
        iconLeft={<span className="fl-search__go" onClick={onSubmit}><Search size={20} strokeWidth={1.5} aria-hidden focusable={false} /></span>}
        iconRight={has ? <button type="button" className="fl-clear" aria-label="Clear search" onClick={() => { onClear(); input.current?.focus(); }}><X size={20} strokeWidth={1.5} aria-hidden focusable={false} /></button> : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files"
        aria-label="Search files"
        autoComplete="off"
        enterKeyHint="search"
      />
    </form>
  );
}

/** Every word typed has to be in the file name, in any case. */
const matchesName = (name: string, query: string) => { const n = name.toLowerCase(); return query.toLowerCase().split(/\s+/).filter(Boolean).every((w) => n.includes(w)); };
type Browse = { kind: "all" } | { kind: "search"; query: string } | { kind: "category"; category: FileCategory };
const ALL: Browse = { kind: "all" };

/** The search field, the category chips and the list (or its No results and empty category blocks). */
function FileBrowser({ projectId, files, onUpload }: { projectId: string; files: ProjectFile[]; onUpload: () => void }) {
  const [draft, setDraft] = useState("");
  const [browse, setBrowse] = useState<Browse>(ALL);
  const submit = () => { const q = draft.trim(); setBrowse(q ? { kind: "search", query: q } : ALL); };
  const change = (v: string) => { setDraft(v); if (!v.trim() && browse.kind === "search") setBrowse(ALL); };
  const clear = () => { setDraft(""); if (browse.kind === "search") setBrowse(ALL); };
  const pick = (c: string) => {
    setDraft("");
    if (c === "All") setBrowse(ALL);
    else setBrowse((b) => (b.kind === "category" && b.category === c ? ALL : { kind: "category", category: c as FileCategory }));
  };
  const isOn = (c: string) => (browse.kind === "category" ? browse.category === c : c === "All");
  const shown = files.filter((f) => (browse.kind === "search" ? matchesName(f.name, browse.query) : browse.kind === "category" ? f.category === browse.category : true));
  const label = browse.kind === "search"
    ? `${shown.length} ${shown.length === 1 ? "file" : "files"} for '${browse.query}'`
    : browse.kind === "category" ? `${browse.category} (${shown.length})` : `ALL FILES (${shown.length})`;
  return (
    <section className="fl-browser" data-m="up" aria-label="File browser">
      <SearchField value={draft} onChange={change} onSubmit={submit} onClear={clear} />
      <Categories isOn={isOn} onPick={pick} />
      {shown.length === 0 ? (
        <div aria-live="polite">
          {browse.kind === "search" ? (
            <Empty className="cw-empty fl-empty" title={`No files match '${browse.query}'`} text="Try a different word, or clear the search to see all your files." action={<Button onClick={clear}>Clear search</Button>} />
          ) : (
            <Empty className="cw-empty fl-empty" title={`No ${browse.kind === "category" ? browse.category.toLowerCase() : "files"} yet.`} text="Add documents, references and resources for your team." action={<Button onClick={onUpload}>Upload file</Button>} />
          )}
        </div>
      ) : (
        <div className="fl-list">
          <div className="fl-list__head"><h2 className="fl-list__label" aria-live="polite">{label}</h2></div>
          <ul className="fl-rows" aria-label="Files">{shown.map((f) => <li key={f.id}><FileRow f={f} href={fileHref(projectId, f)} /></li>)}</ul>
        </div>
      )}
    </section>
  );
}

export default function Files({ projectId }: { projectId: string }) {
  const { ws, files, add, remove } = useProjectFiles(projectId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  if (!ws.project) return null;
  const project = ws.project;
  const empty = files.length === 0;

  const head = (
    <PageHead label="FILES" title={"Everything the project\nis built on."} lead="Shared documents, references and materials in one place.">
      <div className="cw-actions cw-actions--btns">
        <Button onClick={() => setUploadOpen(true)}>Upload file</Button>
        <Button variant="secondary" onClick={() => setCreateOpen(true)}>Create document</Button>
      </div>
    </PageHead>
  );
  const dialogs = (
    <>
      <UploadModal open={uploadOpen} project={project} onClose={() => setUploadOpen(false)} onUpload={({ file, work, milestone }) => {
        setUploadOpen(false);
        const id = add({ name: file.name, category: categoryOf(file.name), work: work.trim() || undefined, milestone: milestone.trim() || undefined });
        toast.show({ message: "File uploaded. It is in Files now.", actionLabel: "Undo", duration: TOAST_MS, onAction: () => remove(id) });
      }} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={({ title, category }) => {
        setCreateOpen(false);
        const id = add({ name: title, category, doc: true });
        toast.show({ message: "Document created. It is in Files now.", actionLabel: "Undo", duration: TOAST_MS, onAction: () => remove(id) });
      }} />
    </>
  );

  if (empty) {
    return (
      <WorkspaceFrame projectId={projectId} active="files" rail="short">
        <div className="fl-page">
          {head}
          <div data-m="up"><Empty className="cw-empty fl-empty" title={"Your project materials\nwill live here."} text="Add documents, references and resources for your team." action={<Button arrow="up-right" onClick={() => setUploadOpen(true)}>Upload file</Button>} /></div>
        </div>
        {dialogs}
      </WorkspaceFrame>
    );
  }
  return (
    <WorkspaceFrame projectId={projectId} active="files" rail="full">
      <div className="fl-page">
        {head}
        <FileBrowser projectId={projectId} files={files} onUpload={() => setUploadOpen(true)} />
      </div>
      {dialogs}
    </WorkspaceFrame>
  );
}
