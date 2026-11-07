"use client";

import { useSearchParams } from "next/navigation";
import Button from "@/components/kin/Button";
import { faceSrc } from "@/components/kin/home/parts";
import { useCollab } from "@/lib/collab/useCollab";
import { memberPage } from "@/lib/collab/members";
import { discoverProject } from "@/lib/collab/projects";
import type { PersonId } from "@/lib/data/people";
import { Back, Bar, DsLink, Facts, InterestPanel, Item, Match, PageState, PrivacyPanel, Section, SkelSection, SkelSide, Tags, pageStatus } from "./parts";

/*
 * A member's page as seen from a project (the design's collaborate/members/<slug>; classes in
 * ../styles/projects.css): who they are, their skills and way of working, and their part in the project, beside the
 * project's interest panel. Someone who shares fewer details gets the design's limited page. The project is the
 * one named by ?project=, or else the first open call they lead or are on.
 */

export default function MemberPage({ id }: { id: string }) {
  const collab = useCollab();
  const asked = useSearchParams().get("project");
  const status = pageStatus(collab);
  if (status === "loading") return <LoadingProfile />;

  const projects = collab.calls.map((c) => discoverProject(c, collab.projects));
  const project = projects.find((p) => p.id === asked && p.team.some((t) => t.id === id))
    ?? projects.find((p) => p.ownerId === id && !p.closed)
    ?? projects.find((p) => p.team.some((t) => t.id === id));
  const m = project ? memberPage(id as PersonId, project) : undefined;
  const back = project ? `/collaborate/projects/${encodeURIComponent(project.id)}` : "/collaborate/discover";

  if (status === "error" || !project || !m) {
    return (
      <div className="dsc-page"><div className="dsc-stack">
        <Back href={back}>{project ? `Back to ${project.title}` : "Back to discover projects"}</Back>
        <PageState pair role="alert" headline="We could not load this profile." support="Check your connection and try again. Your saved projects are safe.">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" href={back}>{project ? "Back to project" : "Back to discover projects"}</Button>
        </PageState>
      </div></div>
    );
  }

  const limited = m.limited;
  const saved = collab.state.saved.includes(project.id);
  const portrait = limited ? undefined : faceSrc(m.portraitId, 560);
  const pr = m.profile;
  return (
    <div className="dsc-page">
      <div className="dsc-detail">
        <div className="dsc-detail__main">
          <Back href={back}>Back to {project.title}</Back>
          <span className="dsc-spacer" style={{ height: 36 }} />
          <header className="dsc-profile-head">
            {portrait
              // eslint-disable-next-line @next/next/no-img-element -- the member's portrait
              ? <img className="dsc-profile-head__portrait" src={portrait} alt={m.name} width={280} height={352} loading="lazy" decoding="async" />
              : <div className="dsc-profile-head__portrait dsc-profile-head__portrait--initials" aria-hidden="true">{m.initials}</div>}
            <div className="dsc-profile-head__info">
              <p className="dsc-profile-head__label"><i aria-hidden="true" />{m.kind === "owner" ? "Project owner" : "Team member"}</p>
              <h1 className="dsc-h1 dsc-h1--detail" data-m="words">{m.name}</h1>
              <p className="dsc-profile-head__role">{limited ? m.role : `${m.role}, ${m.place}`}</p>
              <p className="dsc-profile-head__intro">{limited ? m.limitedIntro : m.headline}</p>
              <Tags tags={m.keySkills} label="Key skills" />
            </div>
          </header>
          {pr ? (
            <>
              <Section title="About"><p className="dsc-body">{pr.about}</p></Section>
              <Section title="Experience"><div className="dsc-items">{pr.experience.map((e) => <Item key={e.title} title={e.title} detail={e.detail} />)}</div></Section>
            </>
          ) : null}
          <Section title="Skills"><Tags tags={pr?.skills ?? m.keySkills} label="Skills" /></Section>
          {pr ? (
            <>
              <Section title="Interests"><Tags tags={pr.interests} label="Interests" /></Section>
              <Section title="Working preferences"><Facts rows={pr.preferences} /></Section>
              <Section title="Contributions"><div className="dsc-items">{pr.contributions.map((c) => <Item key={c.title} title={c.title} detail={c.detail} />)}</div></Section>
            </>
          ) : null}
          <Section title="On this project"><Match sentence={m.onProject}><DsLink href={back} arrow>View the project</DsLink></Match></Section>
        </div>
        <aside className="dsc-detail__side" aria-label="Project actions">
          <InterestPanel interestHref={`${back}/interest`} saved={saved} onSave={() => collab.toggleSave(project.id)} />
          <PrivacyPanel text={m.seeing} />
        </aside>
      </div>
    </div>
  );
}

function LoadingProfile() {
  return (
    <div className="dsc-page">
      <div className="dsc-detail" aria-busy="true" aria-label="Loading the profile">
        <div className="dsc-detail__main" aria-hidden="true">
          <Bar w={190} h={14} />
          <span className="dsc-spacer" style={{ height: 36 }} />
          <div className="dsc-profile-head dsc-profile-head--skeleton">
            <Bar w={280} h={352} className="dsc-profile-head__portrait" />
            <div className="dsc-skel-profile-info">
              <Bar w={140} h={12} /><Bar w={320} h={56} /><Bar w={190} h={16} />
              <div className="dsc-skel-profile-info__lines"><Bar w={540} h={18} /><Bar w={500} h={18} /><Bar w={360} h={18} /></div>
              <div className="dsc-skel-chips">{[0, 1, 2].map((i) => <Bar key={i} w={120} h={36} r={999} />)}</div>
            </div>
          </div>
          <SkelSection><Bar w={140} h={12} /><Bar w="100%" h={16} /><Bar w={700} h={16} /></SkelSection>
          <SkelSection><Bar w={140} h={12} />{[0, 1, 2].map((i) => <div key={i} className="dsc-skel-item"><Bar w={340} h={22} /><Bar w={420} h={14} /></div>)}</SkelSection>
          <SkelSection><Bar w={140} h={12} /><div className="dsc-skel-chips">{[0, 1, 2, 3].map((i) => <Bar key={i} w={120} h={36} r={999} />)}</div></SkelSection>
          <SkelSection><Bar w={140} h={12} />{[0, 1, 2, 3].map((i) => <div key={i} className="dsc-skel-row"><Bar w={208} h={14} /><Bar w={400} h={16} /></div>)}</SkelSection>
        </div>
        <SkelSide />
      </div>
    </div>
  );
}
