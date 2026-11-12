"use client";

import { useEffect, useMemo, useRef, useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Modal } from "@/components/kin/Overlay";
import { useCollab } from "@/lib/collab/useCollab";
import { discoverProject, FILTER_GROUPS, filterLabels, hasFilters, matchesFilters, noFilters, PROJECT_TYPES, searchScore, suggestedFilters, type Filters } from "@/lib/collab/projects";
import { useFirstVisit } from "@/components/collaborate/overview-lists/loading";
import { DsLink, PageHead, PageState, ProjectCard, SkeletonCard, pageStatus } from "./parts";

/*
 * Discover Projects, mirrored from the product design (classes in ../styles/projects.css): search, the project type
 * chips, the More filters dialog, and a card for every open call looking for people. Saving uses the member's saved
 * calls. Loading, empty and failed states are the page's real ones.
 */

type View = { query: string; type: string; filters: Filters; touched: boolean };
const START: View = { query: "", type: "", filters: noFilters(), touched: false };
// The design keeps the search and filters while you move around the app, until the page reloads.
let kept: View = START;
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export default function Discover({ variant }: { variant?: "loading" | "empty" }) {
  const collab = useCollab();
  const router = useRouter();
  // The design's Loading frame: the first visit of a session (and the state-loading route, which then goes on to the page).
  const first = useFirstVisit("discover", { stateRoute: variant === "loading", skip: !!variant, onDone: () => router.replace("/collaborate/discover") });
  const [view, setViewState] = useState<View>(() => kept);
  const setView = (fn: (v: View) => View) => setViewState((v) => (kept = fn(v)));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const real = pageStatus(collab);
  const status = first ? "loading" : variant === "empty" ? "ready" : real;
  const { query, type, filters } = view;

  const all = useMemo(() => collab.calls.filter((c) => !c.postedByMe).map((c) => discoverProject(c, collab.projects)), [collab.calls, collab.projects]);
  const shown = useMemo(() => {
    const list = all.filter((p) => (!type || p.type === type) && matchesFilters(p, filters));
    const q = query.trim();
    return q ? list.map((p, i) => ({ p, i, s: searchScore(p, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.p) : list;
  }, [all, query, type, filters]);

  const head = <PageHead eyebrow="Projects looking for people" title="Find a project that needs you." lead="Explore projects from the Akines community and see where your skills could help." link={<DsLink href="/collaborate/saved">Saved projects</DsLink>} />;

  if (status === "error") {
    return (
      <div className="dsc-page"><div className="dsc-stack">{head}
        <PageState pair role="alert" headline="We could not load the projects." support="Check your connection and try again. Your saved projects are safe.">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" href="/collaborate/saved">Saved projects</Button>
        </PageState>
      </div></div>
    );
  }
  if (variant === "empty" || (status === "ready" && all.length === 0)) {
    return (
      <div className="dsc-page"><div className="dsc-stack">{head}
        <PageState headline="No projects are open to collaborators yet." support="When a member starts a project and looks for people, it appears here. You could be the first.">
          <Button href="/collaborate/start">Start a project</Button>
        </PageState>
      </div></div>
    );
  }

  const q = query.trim();
  const filtered = !!type || hasFilters(filters);
  const clearFilters = () => setView((v) => ({ ...v, type: "", filters: noFilters() }));
  const labels = [type, ...filterLabels(filters)].filter(Boolean);
  const open = shown.filter((p) => !p.closed).length;
  const count = open === shown.length ? `${shown.length} ${plural(shown.length, "project", "projects")} open to collaborators` : `${shown.length} ${plural(shown.length, "project", "projects")}, ${open} open to collaborators`;
  const saved = collab.state.saved;

  let results: React.ReactNode;
  if (status === "loading") {
    results = (
      <section className="dsc-results" aria-busy="true" aria-label="Projects">
        <div className="dsc-summary"><p className="dsc-summary__count">Finding projects…</p></div>
        <div className="dsc-grid">{Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}</div>
      </section>
    );
  } else if (shown.length === 0 && q) {
    results = (
      <PageState pair headline={`No projects match “${q}”.`} support="Try a different word, or clear the search to see every open project. You can also start a project of your own.">
        <Button href="/collaborate/start">Start a project</Button>
        <Button variant="secondary" onClick={() => setView((v) => ({ ...v, query: "" }))}>Clear search</Button>
      </PageState>
    );
  } else if (shown.length === 0) {
    results = (
      <PageState pair headline="No projects match these filters." support="Try fewer filters, or clear them to see every open project. You can also start a project of your own.">
        <Button href="/collaborate/start">Start a project</Button>
        <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
      </PageState>
    );
  } else {
    const summary = q ? (
      <div className="dsc-summary">
        <p className="dsc-summary__count" aria-live="polite">{shown.length} {plural(shown.length, "project", "projects")} for “{q}”{filtered ? ` · ${labels.join(", ")}` : ""}</p>
        <DsLink onClick={() => setView((v) => ({ ...v, query: "" }))}>Clear search</DsLink>
      </div>
    ) : filtered ? (
      <div className="dsc-summary">
        <p className="dsc-summary__count" aria-live="polite">{count} · {labels.join(", ")}</p>
        <DsLink onClick={clearFilters}>Clear filters</DsLink>
      </div>
    ) : (
      <div className="dsc-summary">
        <p className="dsc-summary__count" aria-live="polite">{count}</p>
        <span className="dsc-summary__note">Most relevant first</span>
      </div>
    );
    results = (
      <section className="dsc-results" aria-label="Projects">
        {summary}
        <div className="dsc-grid" data-m="stagger">
          {shown.map((p) => <ProjectCard key={p.id} project={p} mode="discover" saved={saved.includes(p.id)} onSave={() => collab.toggleSave(p.id)} />)}
        </div>
      </section>
    );
  }

  return (
    <div className="dsc-page">
      <div className="dsc-stack">
        {head}
        <SearchPanel query={query} onQuery={(v) => setView((x) => ({ ...x, query: v }))} type={type} onType={(t) => setView((x) => ({ ...x, type: t }))} onMore={() => setFiltersOpen(true)} />
        {results}
      </div>
      <FiltersDialog open={filtersOpen} onClose={() => setFiltersOpen(false)} value={filters} touched={view.touched} onApply={(f) => setView((x) => ({ ...x, filters: f, touched: true }))} />
    </div>
  );
}

function SearchPanel({ query, onQuery, type, onType, onMore }: { query: string; onQuery: (v: string) => void; type: string; onType: (t: string) => void; onMore: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  return (
    <section className="dsc-panel" aria-label="Search and filters">
      <div className="dsc-panel__row">
        <div className="dsc-search" data-filled={query ? "true" : undefined}>
          <Search className="dsc-search__icon" size={20} strokeWidth={1.5} aria-hidden focusable={false} />
          <input ref={input} id={id} className="dsc-search__input" type="search" value={query} placeholder="Search by project, skill or place" aria-label="Search by project, skill or place" autoComplete="off" onChange={(e) => onQuery(e.target.value)} />
          {query ? <button type="button" className="dsc-search__clear" aria-label="Clear search" onClick={() => { onQuery(""); input.current?.focus(); }}><X size={18} strokeWidth={1.5} aria-hidden focusable={false} /></button> : null}
        </div>
        <Button variant="secondary" onClick={onMore} aria-haspopup="dialog">More filters</Button>
      </div>
      <div className="dsc-panel__chips" role="group" aria-label="Project type">
        <Chip selected={!type} onClick={() => onType("")}>All projects</Chip>
        {PROJECT_TYPES.map((t) => <Chip key={t} selected={type === t} onClick={() => onType(type === t ? "" : t)}>{t}</Chip>)}
      </div>
    </section>
  );
}

function FiltersDialog({ open, onClose, value, touched, onApply }: { open: boolean; onClose: () => void; value: Filters; touched: boolean; onApply: (f: Filters) => void }) {
  const [draft, setDraft] = useState(value);
  const was = useRef(false);
  // Each time it opens: what you chose last, or the design's suggestion the first time.
  useEffect(() => {
    if (open && !was.current) setDraft(touched ? value : suggestedFilters());
    was.current = open;
  }, [open, touched, value]);
  const toggle = (key: keyof Filters, option: string) => setDraft((d) => {
    const on = d[key].includes(option);
    let next = on ? d[key].filter((x) => x !== option) : [...d[key], option];
    if (key === "location" && !on) next = option === "Anywhere in Nigeria" ? ["Anywhere in Nigeria"] : next.filter((x) => x !== "Anywhere in Nigeria");
    return { ...d, [key]: next };
  });
  return (
    <Modal open={open} onClose={onClose} size="xl" width={1040} className="dsc-modal dsc-modal--filters" eyebrow="More filters" title="Narrow the projects" description="Choose what matters to you. Projects update when you show results."
      footer={<div className="dsc-modal__actions"><Button onClick={() => { onApply(draft); onClose(); }}>Show projects</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></div>}>
      <div className="dsc-filters">
        {FILTER_GROUPS.map((g) => {
          const chosen = draft[g.key];
          return (
            <div key={g.key} className="dsc-filter" role="group" aria-label={g.name}>
              <div className="dsc-filter__label">
                <div className="dsc-filter__name"><span>{g.name}</span><span className="dsc-filter__count">{chosen.length ? `${chosen.length} selected` : "None selected"}</span></div>
                <p className="dsc-filter__desc">{g.description}</p>
              </div>
              <div className="dsc-filter__options">{g.options.map((o) => <Chip key={o} selected={chosen.includes(o)} onClick={() => toggle(g.key, o)}>{o}</Chip>)}</div>
            </div>
          );
        })}
        <div className="dsc-filters__end" />
      </div>
    </Modal>
  );
}
