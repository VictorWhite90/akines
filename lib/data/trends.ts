import type { PhotoKey } from "./images";

export type Region = "Africa" | "Europe" | "Americas" | "Asia" | "Worldwide";
export type Trend = { id: string; title: string; summary: string; region: Region; tag: string; photo: PhotoKey; source: "Circle digest" | "Member share" | "AI summary"; when: string };
export type TrendEvent = { title: string; place: string; when: string; kind: "Exhibition" | "Open call" | "Talk" | "Fair" | "Workshop" };
export type CircleTrends = { topics: string[]; stories: Trend[]; events: TrendEvent[] };

/**
 * Sample "what's happening in this field" content for each circle.
 * Prototype data: headlines are illustrative, not real news.
 */
const t = (id: string, title: string, summary: string, region: Region, tag: string, photo: PhotoKey, source: Trend["source"], when: string): Trend => ({ id, title, summary, region, tag, photo, source, when });
const e = (title: string, place: string, when: string, kind: TrendEvent["kind"]): TrendEvent => ({ title, place, when, kind });

export const TRENDS: Record<string, CircleTrends> = {
  "african-fashion": {
    topics: ["Made-to-order drops", "Hand-loom revival", "Upcycled wax print", "Diaspora capsules"],
    stories: [
      t("af1", "Small ateliers swap seasons for made-to-order runs", "Designers in several African cities are releasing small, ordered-first drops instead of seasonal collections, citing less waste and closer relationships with clients.", "Africa", "Movement", "kenteVest", "Circle digest", "2 days ago"),
      t("af2", "Hand-loom cloth is getting a second look from buyers abroad", "Weavers report growing requests for narrow-strip cloth from boutiques and stylists in Europe, with longer lead times accepted.", "Europe", "Market", "textileRolls", "AI summary", "4 days ago"),
      t("af3", "Diaspora stylists commission cloth straight from weavers", "Direct commissions are replacing middlemen for a growing number of stylists in the Americas, with shared process videos as proof of provenance.", "Americas", "Sourcing", "waxPrint", "Member share", "This week"),
    ],
    events: [e("Cloth-makers' open studio weekend", "Accra", "First weekend of next month", "Workshop"), e("Fitting-room talk: cut for real bodies", "Online", "Thursday · 18:00", "Talk")],
  },
  photography: {
    topics: ["Family archives", "One-image critique", "Film is back", "Street portraits with consent"],
    stories: [
      t("ph1", "Family-archive projects are becoming the quiet centre of new shows", "Curators note more exhibitions built around scanned albums and shoebox prints, often shown next to a voice note from the family.", "Worldwide", "Exhibitions", "photoAlbum", "Circle digest", "3 days ago"),
      t("ph2", "Small darkrooms are opening as shared studios", "Photographers in several cities are pooling chemistry and enlargers, teaching newcomers on weekday evenings.", "Africa", "Craft", "journalCoffee", "Member share", "5 days ago"),
      t("ph3", "Consent-first street photography gains its own vocabulary", "A growing number of photographers are publishing short notes on how they asked, and what they did when the answer was no.", "Europe", "Ethics", "gallerySeated", "AI summary", "This week"),
    ],
    events: [e("Portfolio review evenings", "Nairobi", "Every second Friday", "Talk"), e("Call for archive-based work", "Online", "Closes in 12 days", "Open call")],
  },
  "digital-art": {
    topics: ["Wax-print collage", "Generative pattern", "Motion posters", "Fair tools for artists"],
    stories: [
      t("da1", "Pattern libraries built from adire and kuba motifs", "Digital artists are sharing motif sets with notes on the communities they come from, and asking for credit and permission to travel with them.", "Africa", "Tools", "waxPrint", "Circle digest", "2 days ago"),
      t("da2", "Motion posters replace static flyers for small shows", "Short looping posters are becoming the default way to announce studio events, made in an afternoon.", "Worldwide", "Craft", "collabArt", "AI summary", "4 days ago"),
      t("da3", "Artists compare licensing terms for prints", "A thread of members swapped plain-language licence wording for limited-edition digital prints.", "Americas", "Business", "textileStack", "Member share", "This week"),
    ],
    events: [e("Collage jam: one shared canvas", "Online", "Saturday · 15:00", "Workshop"), e("Open call: motion pieces under 30 seconds", "Online", "Closes in 9 days", "Open call")],
  },
  textiles: {
    topics: ["Natural indigo", "Resist-dye experiments", "Weaving as archive", "Slow cloth"],
    stories: [
      t("tx1", "Natural-indigo workshops are filling up across West Africa", "Dye masters report waiting lists for short residencies, with visitors travelling to learn fermentation and resist patterns.", "Africa", "Craft", "textileHang", "Circle digest", "2 days ago"),
      t("tx2", "Museums are pairing textiles with the voices of their makers", "New displays play short recordings from dyers and weavers beside the cloth, rather than only wall text.", "Europe", "Exhibitions", "textileStack", "AI summary", "5 days ago"),
      t("tx3", "Members compare cassava-resist recipes", "A thread on cassava-paste resist covers consistency, drying time and why the third bath sometimes turns green.", "Worldwide", "Technique", "circleInner", "Member share", "This week"),
    ],
    events: [e("Indigo Futures: open studio day", "Abeokuta", "Next month", "Workshop"), e("Talk: cloth as an archive", "Online", "Wednesday · 19:00", "Talk")],
  },
  ceramics: {
    topics: ["Wood-fired kilns", "Local clay bodies", "Everyday vessels", "Shared kiln nights"],
    stories: [
      t("ce1", "Community kilns are booking out weeks ahead", "Shared firing nights, where potters split the cost of a load, are replacing solo firings for many small studios.", "Africa", "Studio life", "clayVases", "Circle digest", "3 days ago"),
      t("ce2", "Potters revisit local clay instead of imported bodies", "More makers are testing clay from nearby riverbanks, sharing shrinkage and glaze-fit notes with each other.", "Worldwide", "Technique", "clayBrown", "Member share", "5 days ago"),
      t("ce3", "Buyers are choosing everyday cups over display pieces", "Shops report steadier sales of daily-use ware than of sculptural pieces.", "Europe", "Market", "clayHands", "AI summary", "This week"),
    ],
    events: [e("Kiln-opening evening", "Johannesburg", "Friday · 17:00", "Workshop"), e("Glaze chemistry for beginners", "Online", "Sunday · 14:00", "Talk")],
  },
  collectors: {
    topics: ["Buying slowly", "Payment plans", "Living with art", "Buying direct from studios"],
    stories: [
      t("co1", "Instalment plans are widening who can collect", "More artists and galleries are offering small monthly payments, and collectors say it changes how carefully they choose.", "Worldwide", "Market", "galleryTwo", "Circle digest", "2 days ago"),
      t("co2", "Studio visits are becoming the first step to buying", "Collectors describe a studio visit, in person or live, as the moment they decide, more than any catalogue.", "Africa", "Habits", "frameWall", "Member share", "4 days ago"),
      t("co3", "Condition reports and care notes are becoming standard", "Buyers increasingly ask for a plain care note with the artwork, and artists are happy to write one.", "Europe", "Care", "galleryHall", "AI summary", "This week"),
    ],
    events: [e("First-time collectors' evening", "Online", "Tuesday · 19:00", "Talk"), e("Open studios weekend", "Lagos", "Next Saturday", "Fair")],
  },
  curators: {
    topics: ["Wall text that trusts the viewer", "Artist-led spaces", "Touring small shows", "Fair pay for makers"],
    stories: [
      t("cu1", "Curators experiment with shorter wall texts", "Several shows are replacing paragraphs with a single question beside each work, and reporting longer visits.", "Europe", "Practice", "galleryHall", "Circle digest", "3 days ago"),
      t("cu2", "Artist-led spaces are pooling shows to travel together", "Small spaces across the continent are sharing crates and installation guides to tour group shows cheaply.", "Africa", "Exhibitions", "galleryViewer", "AI summary", "5 days ago"),
      t("cu3", "Open calls now publish their fees up front", "More calls list artist fees and transport in the first paragraph, and members say it saves everyone time.", "Worldwide", "Ethics", "frameWall", "Member share", "This week"),
    ],
    events: [e("Studio-visit note swap", "Online", "Wednesday · 18:30", "Talk"), e("Open call: portraits, group show", "London", "Closes in 9 days", "Open call")],
  },
  diaspora: {
    topics: ["Objects from home", "Return and belonging", "Language and art", "Second-generation voices"],
    stories: [
      t("di1", "Diaspora artists are making work about the object they carried", "Shows built around a single suitcase item are appearing in several cities, each with a short story from the maker.", "Europe", "Exhibitions", "bronzeHead", "Circle digest", "2 days ago"),
      t("di2", "Return residencies are growing", "More organisations are offering short residencies for artists visiting family homes, with a local mentor.", "Africa", "Residencies", "carvedRelief", "AI summary", "4 days ago"),
      t("di3", "Members share how they teach children the artwork at home", "A thread on introducing the pieces on the wall to kids became a small reading list.", "Americas", "Family", "circleIndigo", "Member share", "This week"),
    ],
    events: [e("Circle meet-up: what home looks like", "Online", "Thursday · 20:00", "Talk"), e("Open call: works about return", "Nairobi", "Closes in 14 days", "Open call")],
  },
  "young-artists": {
    topics: ["First shows", "Pricing your first work", "Studio on a budget", "Critique without fear"],
    stories: [
      t("ya1", "Peer critique circles are replacing solo portfolio reviews", "Groups of five give each other a written response before meeting, and say it feels safer and more useful.", "Worldwide", "Practice", "paintingDancers", "Circle digest", "2 days ago"),
      t("ya2", "Shared studios are opening in student neighbourhoods", "Artists split rent for a room and a good light, and swap materials at the end of each month.", "Africa", "Studio life", "studioBusy", "Member share", "4 days ago"),
      t("ya3", "Graduate shows go hybrid", "More schools are streaming private views, so families and collectors far away can drop in.", "Europe", "Exhibitions", "galleryViewer", "AI summary", "This week"),
    ],
    events: [e("First-show clinic", "Online", "Monday · 18:00", "Talk"), e("Open call: emerging voices", "Lagos", "Closes in 12 days", "Open call")],
  },
  "traditional-arts": {
    topics: ["Apprenticeships", "Lineage and credit", "Carving today", "Bronze casting revival"],
    stories: [
      t("tr1", "Apprenticeship programmes are pairing elders with students", "Short structured apprenticeships with a master carver or weaver are opening, with stipends for both.", "Africa", "Learning", "carvedGroup", "Circle digest", "3 days ago"),
      t("tr2", "Museums begin naming individual makers, not only regions", "Labels are increasingly crediting the family workshop or maker where it's known.", "Europe", "Credit", "woodFigure", "AI summary", "5 days ago"),
      t("tr3", "Bronze casters share safety practices", "Members traded notes on ventilation, moulds and how to teach newcomers without cutting corners.", "Worldwide", "Craft", "bronzeHead", "Member share", "This week"),
    ],
    events: [e("Carving demonstration and Q&A", "Kumasi", "Saturday · 11:00", "Workshop"), e("Talk: crediting the hand", "Online", "Tuesday · 19:30", "Talk")],
  },
};
