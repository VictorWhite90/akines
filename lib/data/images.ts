/**
 * Sample photos standing in for real Akines content, all served from our own origin (public/kin/**) and resized
 * by scripts/images.mjs. Keys say what the picture shows so pages can pick by subject. The /kin/photos ones are
 * stock photos (Unsplash) downloaded once; the portraits are the designer's members.
 */
export type Photo = { src: string; alt: string };

const photo = (src: string, alt: string): Photo => ({ src, alt });

export const PHOTO = {
  kincircleHero: photo("/kincirclebg.jpg", "Five creatives gathered around a laptop and a spread of prints, deep in conversation"),
  teamWork: photo("/akines/collaborate-hero.jpg", "A team around a table with laptops, notes and coffee, talking and laughing"),
  collabArt: photo("/kin/photos/collab-art.jpg", "Colourful contemporary artwork"),
  textileHang: photo("/kin/photos/textile-hang.jpg", "Hand-dyed cloths hanging in orange, red and gold"),
  studioBusy: photo("/kin/photos/studio-busy.jpg", "A crowded studio with paintings and furniture"),
  paintingDancers: photo("/kin/photos/painting-dancers.jpg", "A painting of three figures dancing in a vibrant abstract landscape"),
  journalOpen: photo("/kin/photos/journal-open.jpg", "A woman writing in a notebook with a pen"),
  journalPen: photo("/kin/photos/journal-pen.jpg", "A hand writing on paper with a pen"),
  notebookWhite: photo("/kin/photos/notebook-white.jpg", "A white notebook on a soft white cloth"),
  beadsShop: photo("/kin/photos/beads-shop.jpg", "Colourful beaded necklaces hanging outside a shop"),
  calmBench: photo("/kin/photos/calm-bench.jpg", "A woman sitting on a bench looking out over mountains"),
  talkMugs: photo("/kin/photos/talk-mugs.jpg", "Two people holding grey mugs at a table"),
  talkTwo: photo("/kin/photos/talk-two.jpg", "Two women facing each other across a table by a glass wall"),
  talkGroup: photo("/kin/photos/talk-group.jpg", "A group of people gathered around a white table"),
  talkCafe: photo("/kin/photos/talk-cafe.jpg", "A group sharing food and drinks around a table"),
  talkLaugh: photo("/kin/photos/talk-laugh.jpg", "Friends sitting around a wooden table, talking"),
  talkYoung: photo("/kin/photos/talk-young.jpg", "Two young women talking at a cafe table"),
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTO;

/** Portrait models for the fictional members. */
export const FACE = {
  // The designer's members (public/kin/design/people, their file names under their folders)
  p_kemi: photo("/kin/design/people/team/kemi.jpg", "Portrait of Kemi Adeyemi"),
  p_amaraOkafor: photo("/kin/design/people/community/av-amara.jpg", "Portrait of Amara Okafor"),
  p_amaraObi: photo("/kin/design/people/team/amara.jpg", "Portrait of Amara Obi"),
  p_ayoBalogun: photo("/kin/design/people/feed/avatar-ayo.jpg", "Portrait of Ayo Balogun"),
  p_ayoBello: photo("/kin/design/people/team/ayo.jpg", "Portrait of Ayo Bello"),
  p_yusufUmar: photo("/kin/design/people/feed/avatar-yusuf.jpg", "Portrait of Yusuf Umar"),
  p_yusufDanjuma: photo("/kin/design/people/team/yusuf.jpg", "Portrait of Yusuf Danjuma"),
  p_ngozi: photo("/kin/design/people/community/av-ngozi.jpg", "Portrait of Ngozi Eze"),
  p_tundeBakare: photo("/kin/design/people/community/av-tunde.jpg", "Portrait of Tunde Bakare"),
  p_tundeBello: photo("/kin/design/people/community/tunde.jpg", "Portrait of Tunde Bello"),
  p_chuka: photo("/kin/design/people/community/av-chuka.jpg", "Portrait of Chuka Nwosu"),
  p_folake: photo("/kin/design/people/community/av-folake.jpg", "Portrait of Folake Adeniran"),
  p_anaya: photo("/kin/design/people/discover/person-anaya.jpg", "Portrait of Anaya Smith"),
  p_thandi: photo("/kin/design/people/workspace/ayo.jpg", "Portrait of Thandi Dlamini"),
  p_amina: photo("/kin/design/people/collab-people/amina.jpg", "Portrait of Amina Yusuf"),
  p_kunle: photo("/kin/design/people/collab-people/kunle.jpg", "Portrait of Kunle Afolabi"),
  p_funmi: photo("/kin/design/people/collab-people/funmi.jpg", "Portrait of Funmi Okoro"),
  p_chidi: photo("/kin/design/people/collab-people/chidi.jpg", "Portrait of Chidi Nwosu"),
  p_adaeze: photo("/kin/design/people/team/adaeze.jpg", "Portrait of Adaeze Okoye"),
  p_tobi: photo("/kin/design/people/team/tobi.jpg", "Portrait of Tobi Adeyemi"),
  p_obinna: photo("/kin/design/people/collab-projects/obinna-adeyemi.jpg", "Portrait of Obinna Adeyemi"),
  p_tolu: photo("/kin/design/people/team/tolu.jpg", "Portrait of Tolu Okafor"),
  p_funke: photo("/kin/design/people/team/funke.jpg", "Portrait of Funke Adebayo"),
  p_bisiFashola: photo("/kin/design/people/team/bisi.jpg", "Portrait of Bisi Fashola"),
  p_emekaNwosu: photo("/kin/design/people/team/emeka.jpg", "Portrait of Emeka Nwosu"),
} as const satisfies Record<string, Photo>;

export type FaceKey = keyof typeof FACE;
