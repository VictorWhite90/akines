import { ANCHORS, LINKS } from '@/lib/landing/links';

/**
 * All page copy. Line breaks ("\n") are soft: they apply from tablet width up and
 * are ignored on mobile, where the text wraps naturally (see <Lines />).
 */

export type IconName =
  | 'users'
  | 'message-circle'
  | 'lightbulb'
  | 'heart-handshake'
  | 'users-round'
  | 'store'
  | 'messages-square'
  | 'blocks'
  | 'gamepad-2'
  | 'door-open'
  | 'scan-eye'
  | 'handshake'
  | 'notebook-pen'
  | 'refresh-cw'
  | 'git-compare-arrows'
  | 'shield-check'
  | 'heart'
  | 'sprout'
  | 'quote'
  | 'trending-up';

const img = (name: string) => `/landing/images/${name}.jpg`;

export const hero = {
  image: img('hero'),
  imageAlt: 'Friends laughing together outdoors',
  eyebrow: 'A new way to connect',
  headline: 'Find people you can genuinely know,\ntrust and create with.',
  primary: { label: 'Find my kind of connection', href: LINKS.join },
  secondary: { label: 'Discover Akines', href: ANCHORS.philosophy },
};

export const nav = {
  menuLinks: [
    { label: 'Our philosophy', href: ANCHORS.philosophy },
    { label: 'How it works', href: ANCHORS.howItWorks },
    { label: 'Community', href: ANCHORS.community },
    { label: 'Contact', href: ANCHORS.contact },
  ],
  signIn: { label: 'Sign in', href: LINKS.signIn },
  join: { label: 'Join Akines', href: LINKS.join },
  tagline: 'Less scrolling. More belonging.',
};

export const intention = {
  eyebrow: 'Begin with yourself',
  headline: 'Every connection begins\nwith a reason.',
  body: "You don't always need the same thing from people. Sometimes you want company. Sometimes you want to be understood. Sometimes you want to make something that didn't exist before.",
  lead: 'Akines helps you begin with what matters to you.',
  panels: [
    {
      id: 'connection',
      order: 1,
      label: '01 / Connection',
      icon: 'users' as IconName,
      heading: 'I want company.',
      body: 'Meet people who share your interests, understand your world and make ordinary moments feel less ordinary.',
      cta: 'Discover connection',
      href: LINKS.join,
      image: img('connection'),
      imageAlt: 'Two friends sharing a quiet moment on a park bench',
      shape: 'portrait' as const,
    },
    {
      id: 'conversation',
      order: 2,
      label: '02 / Conversation',
      icon: 'message-circle' as IconName,
      heading: 'I want to be understood.',
      body: 'Find space for honest conversation, shared perspectives and the kind of listening that makes people feel seen.',
      cta: 'Explore conversation',
      href: LINKS.join,
      image: img('conversation'),
      imageAlt: 'Friends in conversation at a cafe table',
      shape: 'landscape' as const,
    },
    {
      id: 'creation',
      order: 3,
      label: '03 / Creation',
      icon: 'lightbulb' as IconName,
      heading: 'I want to create something.',
      body: 'Meet people whose skills, ideas and perspectives complement your own. Start with an idea and build together.',
      cta: 'Discover collaboration',
      href: LINKS.join,
      image: img('creation'),
      imageAlt: 'People collaborating around a studio table',
      shape: 'landscape' as const,
    },
    {
      id: 'continuity',
      order: 4,
      label: '04 / Continuity',
      icon: 'heart-handshake' as IconName,
      heading: 'I want to stay connected.',
      body: 'Make room for the people already in your life through shared activities, recurring rituals and thoughtful check-ins.',
      cta: 'Explore ways to continue',
      href: LINKS.join,
      image: img('continuity'),
      imageAlt: 'Friends walking together along a sunlit street',
      shape: 'portrait' as const,
    },
  ],
};

export const rhythm = {
  eyebrow: 'The Akines rhythm',
  headline: 'Meaningful connection\ndoesn’t happen all at once.',
  body: 'It grows through small moments: showing up honestly, understanding another person, doing something together and choosing to continue.',
  lead: 'Akines creates space for each of those moments.',
  image: img('immersive'),
  imageAlt: 'Friends gathered around a long table in a garden at golden hour',
  steps: [
    {
      n: '01',
      title: 'Arrive',
      line: 'Start with what matters to you.',
      description:
        'Share what you need from this moment, what interests you and how you would like to connect.',
      icon: 'door-open' as IconName,
      image: img('step-1-arrive'),
      imageAlt: 'A woman arriving at a doorway',
    },
    {
      n: '02',
      title: 'Understand',
      line: 'See the person beyond the profile.',
      description:
        'Discover shared interests, complementary strengths and the reasons a connection could be meaningful.',
      icon: 'scan-eye' as IconName,
      image: img('step-2-understand'),
      imageAlt: 'A man listening attentively',
    },
    {
      n: '03',
      title: 'Do',
      line: 'Give the connection something to grow around.',
      description:
        'Talk, play, learn, create or solve a problem together. Shared experiences help conversations become relationships.',
      icon: 'handshake' as IconName,
      image: img('step-3-do'),
      imageAlt: 'Friends playing a board game together',
    },
    {
      n: '04',
      title: 'Reflect',
      line: 'Notice what the moment meant.',
      description:
        'Take a moment to recognise what you learned, felt or contributed. Reflection is optional and should remain under your control.',
      icon: 'notebook-pen' as IconName,
      image: img('step-4-reflect'),
      imageAlt: 'A man reflecting with a notebook',
    },
    {
      n: '05',
      title: 'Continue',
      line: 'Let a good moment become a lasting connection.',
      description:
        'Choose another conversation, a shared plan or a simple check-in that keeps the relationship moving.',
      icon: 'refresh-cw' as IconName,
      image: img('step-5-continue'),
      imageAlt: 'Two friends talking on riverside steps',
    },
  ],
  cta: { label: 'Explore the Akines philosophy', href: LINKS.philosophy },
};

export type Experience = {
  id: string;
  name: string;
  label: string;
  icon: IconName;
  tagline: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  /** Shows a "Concept preview" tag for experiences that are not live yet. */
  concept?: boolean;
};

export const experiences = {
  eyebrow: 'A world of possibility',
  headline: 'Different ways to connect.\nOne reason to begin.',
  body: 'Some connections start with a conversation. Others begin with a shared project, a game or a small group that grows together. Akines brings different experiences into one place, so connection can take the form that feels right for you.',
  kincircle: {
    id: 'kincircle',
    name: 'KinCircle',
    label: 'Small groups · Shared growth',
    icon: 'users-round',
    tagline: 'A little space to belong.',
    body: 'Find your place in a small group built around shared interests, intentions or experiences. Return to the same people, build familiarity and let trust grow over time.',
    cta: 'Discover KinCircle',
    href: LINKS.join,
    image: img('kincircle'),
    imageAlt: 'A small circle of friends gathered together',
  } satisfies Experience,
  banter: {
    id: 'banter',
    name: 'Banter',
    label: 'Conversation · Shared curiosity',
    icon: 'messages-square',
    tagline: 'Start with a question. See where it takes you.',
    body: 'Banter gives people a simple way into conversation through thoughtful prompts, shared perspectives and moments of spontaneity. No elaborate introduction is needed. Just a reason to begin.',
    cta: 'Discover Banter',
    href: LINKS.join,
    image: img('banter'),
    imageAlt: 'Two friends laughing together in a cafe',
  } satisfies Experience,
  create: {
    id: 'create',
    name: 'Create',
    label: 'Collaboration · Shared purpose',
    icon: 'blocks',
    tagline: 'Good ideas deserve good company.',
    body: 'Meet people who bring different skills, experiences and perspectives to a shared ambition. Turn an initial idea into a project you can develop together.',
    cta: 'Discover Create',
    href: LINKS.join,
    image: img('create'),
    imageAlt: 'A maker working at a bench in a workshop',
  } satisfies Experience,
  myStore: {
    id: 'my-store',
    name: 'My Store',
    label: 'Contribution · Community commerce',
    icon: 'store',
    tagline: 'Let what you do become part of what you share.',
    body: 'Showcase your products, services and skills within a community where people can discover what you offer and support your work.',
    cta: 'Discover My Store',
    href: LINKS.join,
    image: img('mystore'),
    imageAlt: 'A maker arranging handmade ceramics in her shop',
  } satisfies Experience,
  playTogether: {
    id: 'play-together',
    name: 'Play Together',
    label: 'Play · Shared moments',
    icon: 'gamepad-2',
    tagline: 'Sometimes the easiest way to connect is to play.',
    body: 'Discover games and shared activities that give people a reason to laugh, participate and get to know one another naturally.',
    cta: 'Discover Play Together',
    href: LINKS.join,
    image: img('playtogether'),
    imageAlt: 'Friends laughing over a board game',
  } satisfies Experience,
  wellbeing: {
    id: 'wellbeing',
    name: 'Wellbeing',
    label: 'Reflection · Personal space',
    icon: 'heart-handshake',
    tagline: 'Make room for how you are doing.',
    body: 'Create space for optional check-ins, personal reflection and thoughtful support. Choose what you share, keep private reflections private and decide when you want to engage.',
    cta: 'Explore wellbeing',
    href: LINKS.join,
    image: img('wellbeing'),
    imageAlt: 'A young man holding a mug and looking out of a window',
  } satisfies Experience,
};

export const trust = {
  eyebrow: 'Connection with intention',
  headline: 'Not every introduction is meaningful.\nThe right one has a reason.',
  body: 'Akines looks beyond surface-level similarities to help people discover why a connection might be worth exploring. Shared interests, complementary strengths, personal intentions and preferred ways of connecting can all inform an introduction.',
  cta: { label: 'Understand our approach', href: LINKS.philosophy },
  /** Seconds each principle stays on screen before the stage advances. */
  autoAdvanceSeconds: 12,
  steps: [
    {
      chip: 'Matching with context',
      icon: 'git-compare-arrows' as IconName,
      eyebrow: 'Meet with more understanding.',
      headline:
        'Discover why an introduction may make\nsense before deciding whether to engage.',
      image: img('trust-1-intention'),
      imageAlt: 'Five friends laughing over a sketchbook on garden steps',
    },
    {
      chip: 'Privacy by design',
      icon: 'shield-check' as IconName,
      eyebrow: 'Your personal world stays yours to control.',
      headline:
        'Choose what you share, keep private reflections\nprivate and retain control over your participation.',
      image: img('trust-2-notice'),
      imageAlt: 'A woman writing in a journal beside a window',
    },
    {
      chip: 'Wellbeing without assumptions',
      icon: 'heart' as IconName,
      eyebrow: 'Support that respects your boundaries.',
      headline:
        'Room for personal reflection, without assuming\nhow you feel or requiring disclosure.',
      image: img('trust-3-control'),
      imageAlt: 'A woman holding a mug on a sunny balcony full of plants',
    },
    {
      chip: 'Trust that develops over time',
      icon: 'sprout' as IconName,
      eyebrow: 'Connection is a process, not a score.',
      headline:
        'Meaningful relationships grow through repeated experiences,\nmutual respect and the freedom to decide what comes next.',
      image: img('trust-4-belonging'),
      imageAlt: 'Two longtime friends laughing over a shared meal',
    },
  ],
};

export const community = {
  eyebrow: 'Beyond the first hello',
  headline: 'A good connection\nchanges what happens next.',
  body: 'Akines is designed around the moments that give connection a life beyond the first introduction.',
  image: img('community'),
  imageNarrow: img('community-full'),
  imageAlt: 'Neighbours building benches and planters together in a community garden',
  moments: [
    { icon: 'quote' as IconName, text: 'A conversation can\nbecome a friendship.' },
    { icon: 'users-round' as IconName, text: 'A shared interest can\nbecome a community.' },
    {
      icon: 'trending-up' as IconName,
      text: 'An idea can become something that people build together.',
    },
  ],
  invitation: {
    headline: 'An early community.\nA more intentional way to connect.',
    body: 'Akines is being shaped around a simple belief: technology should help people build relationships that matter. Be part of the community helping that idea take shape.',
    cta: { label: 'Join the Akines community', href: LINKS.join },
  },
};

export const closing = {
  image: img('closing'),
  imageNarrow: img('closing-full'),
  imageAlt: 'Friends walking together through golden countryside',
  eyebrow: 'Your next chapter starts here',
  headline: 'The people you are looking for\nmay be looking for a connection like yours.',
  body: 'Begin with what matters to you. Discover people, experiences and possibilities worth making room for.',
  primary: { label: 'Find my kind of connection', href: LINKS.join },
  secondary: { label: 'Explore Akines', href: ANCHORS.experiences },
};

export const footer = {
  tagline: nav.tagline,
  columns: [
    {
      heading: 'Discover',
      links: [
        { label: 'KinCircle', href: '#kincircle' },
        { label: 'Banter', href: '#banter' },
        { label: 'Create', href: '#create' },
        { label: 'Play Together', href: '#play-together' },
        { label: 'My Store', href: '#my-store' },
        { label: 'Wellbeing', href: '#wellbeing' },
      ],
    },
    {
      heading: 'About Akines',
      links: [
        { label: 'Our philosophy', href: ANCHORS.philosophy },
        { label: 'How it works', href: ANCHORS.howItWorks },
        { label: 'Community', href: ANCHORS.community },
        { label: 'Contact', href: LINKS.contact },
      ],
    },
    {
      heading: 'Your trust',
      links: [
        { label: 'Privacy', href: LINKS.privacy },
        { label: 'Community guidelines', href: LINKS.guidelines },
        { label: 'Safety and wellbeing', href: LINKS.safety },
      ],
    },
    {
      heading: 'Your account',
      links: [
        { label: 'Sign in', href: LINKS.signIn },
        { label: 'Join Akines', href: LINKS.join },
      ],
    },
  ],
  legal: {
    copyright: '© Akines',
    links: [
      { label: 'Privacy', href: LINKS.privacy },
      { label: 'Terms', href: LINKS.terms },
      { label: 'Accessibility', href: LINKS.accessibility },
    ],
  },
};
