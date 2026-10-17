import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* ---------- Types ---------- */
export const CATEGORIES = ["Food", "Classes", "Services", "Fashion", "Home", "Art & craft", "Books & prints", "Wellbeing"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  title: string;
  category: Category;
  /** Price in US dollars. */
  price: number;
  medium: string;
  size: string;
  year: number;
  story: string;
  /** Catalogue photo keys; the first is the cover. */
  photos: PhotoKey[];
  /** A seeded artist, or the member ("amara") for products made in My store. */
  seller: PersonId;
  /** Pieces available. Unique originals have stock 1 and `unique: true`. */
  stock: number;
  unique: boolean;
  tags: string[];
  status: "published" | "draft";
  shipping?: string;
  createdAt: number;
};

export type OrderStatus = "paid" | "shipped" | "delivered";
export type Delivery = "standard" | "express";
export type Payment = "card" | "mobile" | "bank";

export type Order = {
  id: string;
  number: string;
  productId: string;
  title: string;
  photo: PhotoKey;
  seller: PersonId;
  qty: number;
  unitPrice: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  placedAt: number;
  delivery: Delivery;
  payment: Payment;
  /** Who bought it (for orders arriving at the member's store). */
  buyer: string;
  ship: { name: string; address: string; city: string; country: string };
  /** Marked true on made-up incoming orders so the Orders tab is never empty. */
  sample?: boolean;
};

export type StoreProfile = {
  name: string;
  tagline: string;
  categories: Category[];
  city: string;
  cover: PhotoKey;
  about: string;
  createdAt: number;
};

/* ---------- Storage keys (shared with other pages) ---------- */
export const KEY_STORE = "ac:store";
export const KEY_PRODUCTS = "ac:products";
export const KEY_ORDERS = "ac:orders";
export const KEY_SALES = "ac:sales";
export const KEY_SAVED = "ac:saved";

/* ---------- Money and labels ---------- */
export const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
export const SHIPPING: Record<Delivery, { label: string; note: string; cost: number }> = {
  standard: { label: "Standard", note: "5 to 9 working days", cost: 28 },
  express: { label: "Express", note: "2 to 4 working days", cost: 55 },
};
export const PAYMENTS: Record<Payment, { label: string; note: string }> = {
  card: { label: "Card", note: "Pay by debit or credit card on a secure page." },
  mobile: { label: "Mobile money", note: "Approve the payment on your phone." },
  bank: { label: "Bank transfer", note: "We show you where to send it." },
};
export const STATUS_LABEL: Record<OrderStatus, string> = { paid: "Paid", shipped: "Shipped", delivered: "Delivered" };
export const orderNumber = () => `AC-${Math.floor(10000 + Math.random() * 89999)}`;

/* ---------- Photos a member can pick from when adding a product ---------- */
export const PRODUCT_PHOTOS: PhotoKey[] = [
  "talkCafe", "talkGroup", "talkLaugh", "talkTwo", "talkMugs", "talkYoung", "studioBusy", "journalOpen", "journalCoffee", "calmBench", "calmWater", "gallerySeated",
  "paintingWoman", "paintingDancers", "paintingHand", "collabArt", "studioEasel", "frameWall",
  "clayVases", "clayBowl", "clayHands", "clayBrown", "clayWheelTop", "clayWet",
  "bronzeHead", "woodFigure", "woodFigureB", "stoneBoy", "carvedGroup", "carvedRelief",
  "textileStack", "textileRolls", "textileHang", "waxPrint", "circleIndigo", "yellowPrint",
  "kenteVest", "headwrapOrange", "redPatterned", "fanGold", "blueOutfits", "beadsRed",
  "beadsPile", "beadsHung", "beadsGold", "photoAlbum", "galleryHall", "galleryTwo",
];
export const COVER_CHOICES: PhotoKey[] = ["talkCafe", "studioBusy", "talkGroup", "journalCoffee", "calmWater", "clayHands", "waxPrint", "galleryModern"];

/* ---------- Seeded products by the fictional artists ---------- */
const d = (daysAgo: number) => Date.UTC(2026, 8, 24) - daysAgo * 86400000;

export const SEED_PRODUCTS: Product[] = [
  {
    id: "jollof-box", title: "Party jollof, tray for 10", category: "Food", price: 45, medium: "Smoky party jollof, chicken and plantain", size: "Feeds 10", year: 2026,
    story: "My grandmother's recipe, cooked over firewood the way it should be. Order two days ahead and I'll deliver warm in Dakar.",
    photos: ["talkCafe", "talkLaugh"], seller: "fatou", stock: 20, unique: false, tags: ["catering", "party", "jollof"], status: "published", shipping: "Delivered warm within Dakar.", createdAt: d(1),
  },
  {
    id: "cooking-class", title: "Saturday cooking class", category: "Classes", price: 30, medium: "3-hour class, ingredients included", size: "6 seats", year: 2026,
    story: "Learn three dishes from home in a real restaurant kitchen. You eat what you cook, and you leave with the recipes.",
    photos: ["talkCafe", "talkGroup"], seller: "fatou", stock: 6, unique: false, tags: ["class", "cooking", "weekend"], status: "published", createdAt: d(2),
  },
  {
    id: "code-starter", title: "Learn to code: 8-week starter", category: "Classes", price: 120, medium: "Live online course, 2 evenings a week", size: "8 weeks", year: 2026,
    story: "For complete beginners. By week eight you'll have built and launched your own small website. Plain English, no jargon.",
    photos: ["studioBusy", "journalOpen"], seller: "kwame", stock: 12, unique: false, tags: ["course", "coding", "beginners"], status: "published", createdAt: d(3),
  },
  {
    id: "cv-review", title: "CV and LinkedIn review", category: "Services", price: 25, medium: "One-to-one review, written notes", size: "45 minutes", year: 2026,
    story: "I've hired developers for six years. I'll tell you honestly what makes a recruiter stop scrolling, and rewrite your top section with you.",
    photos: ["talkTwo", "journalOpen"], seller: "kwame", stock: 10, unique: false, tags: ["career", "cv", "review"], status: "published", createdAt: d(4),
  },
  {
    id: "football-camp", title: "Holiday football camp", category: "Classes", price: 60, medium: "5 mornings, ages 8–15", size: "1 week", year: 2026,
    story: "Skills, teamwork and a lot of laughing. Every child plays, every day. Water and snacks provided.",
    photos: ["talkYoung", "talkLaugh"], seller: "tunde", stock: 24, unique: false, tags: ["kids", "football", "holiday"], status: "published", createdAt: d(5),
  },
  {
    id: "health-check", title: "Home health check visit", category: "Wellbeing", price: 20, medium: "Blood pressure, sugar and a friendly chat", size: "30 minutes", year: 2026,
    story: "For older parents who won't go to the clinic. I'll check the basics at home and explain everything in plain words.",
    photos: ["calmBench", "talkMugs"], seller: "ayo", stock: 15, unique: false, tags: ["health", "home visit", "parents"], status: "published", createdAt: d(6),
  },
  {
    id: "burnout-course", title: "Burnout, honestly: 6-week course", category: "Wellbeing", price: 80, medium: "Small group, online", size: "6 weeks", year: 2026,
    story: "Six weekly sessions for people who are always busy and never rested. Practical, gentle and never preachy.",
    photos: ["calmBench", "calmWater"], seller: "nandi", stock: 10, unique: false, tags: ["wellbeing", "group", "course"], status: "published", createdAt: d(7),
  },
  {
    id: "reading-tutor", title: "Reading tutor for children", category: "Classes", price: 15, medium: "One-to-one, online or at home", size: "Per hour", year: 2026,
    story: "For children aged 5–10 who find reading hard. Patient, playful and always encouraging.",
    photos: ["journalCoffee", "talkTwo"], seller: "thandi", stock: 20, unique: false, tags: ["tutoring", "reading", "kids"], status: "published", createdAt: d(8),
  },
  {
    id: "handmade-bowls", title: "Everyday bowls, set of two", category: "Home", price: 35, medium: "Wheel-thrown stoneware", size: "14 cm across, each", year: 2025,
    story: "I teach by day and make pottery on Fridays. These two are for soup, cereal or nothing at all. Each one is a little different.",
    photos: ["clayBowl", "clayHands"], seller: "thandi", stock: 8, unique: false, tags: ["bowls", "handmade", "kitchen"], status: "published", createdAt: d(9),
  },
  {
    id: "family-history", title: "Family history interview", category: "Services", price: 90, medium: "Recorded interview and written story", size: "2 sessions", year: 2026,
    story: "I'll interview your grandparent and turn their memories into a short illustrated story your family will keep.",
    photos: ["photoAlbum", "journalWindow"], seller: "efua", stock: 5, unique: false, tags: ["family", "story", "gift"], status: "published", createdAt: d(10),
  },
  {
    id: "history-book", title: "Twelve Families (pre-order)", category: "Books & prints", price: 18, medium: "Paperback, 180 pages", size: "A5", year: 2026,
    story: "Twelve Kumasi families tell the story of the street they grew up on. Signed copies for pre-orders.",
    photos: ["journalOpen", "photoAlbum"], seller: "efua", stock: 50, unique: false, tags: ["book", "history", "signed"], status: "published", shipping: "Ships in December.", createdAt: d(11),
  },
  {
    id: "pitch-review", title: "Pitch deck review", category: "Services", price: 50, medium: "Written notes and a 30-minute call", size: "1 deck", year: 2026,
    story: "Second-time founder. I'll read your deck like an investor would, and tell you what I'd change before you send it.",
    photos: ["talkTwo", "studioBusy"], seller: "leila", stock: 8, unique: false, tags: ["startup", "pitch", "mentoring"], status: "published", createdAt: d(12),
  },
  {
    id: "portrait-session", title: "Portrait session", category: "Services", price: 70, medium: "1 hour, 10 edited photos", size: "Outdoors or at home", year: 2026,
    story: "Relaxed portraits for your CV, your business or your family. Bring one object that means something to you.",
    photos: ["gallerySeated", "talkLaugh"], seller: "wanjiru", stock: 10, unique: false, tags: ["photography", "portrait", "family"], status: "published", createdAt: d(13),
  },
  {
    id: "pocket-print", title: "What we keep in our pockets", category: "Art & craft", price: 40, medium: "Archival print, edition of 25", size: "40 × 50 cm", year: 2024,
    story: "From a series where strangers emptied their pockets. A key, a folded prayer, half a comb. Number 12 of 25.",
    photos: ["photoAlbum", "galleryHall"], seller: "wanjiru", stock: 6, unique: false, tags: ["print", "photography", "edition"], status: "published", shipping: "Ships rolled in a tube.", createdAt: d(14),
  },
  {
    id: "wrap-jacket", title: "Sunday wrap jacket", category: "Fashion", price: 95, medium: "Cotton wax print", size: "Sizes S to XL", year: 2026,
    story: "Cut to move with you, from the market to the dinner table. Made to order in your size.",
    photos: ["waxPrint", "yellowPrint"], seller: "fatou", stock: 10, unique: false, tags: ["jacket", "made to order", "wax print"], status: "published", shipping: "Made to order. Allow two weeks.", createdAt: d(15),
  },
  {
    id: "bead-bracelet", title: "Beaded bracelet", category: "Fashion", price: 18, medium: "Glass beads, waxed cotton", size: "Adjustable", year: 2026,
    story: "Strung by hand while I host listening circles, one bead at a time.",
    photos: ["beadsRed", "beadsGold"], seller: "nandi", stock: 14, unique: false, tags: ["bracelet", "gift", "handmade"], status: "published", createdAt: d(16),
  },
  {
    id: "indigo-painting", title: "Indigo Room", category: "Art & craft", price: 450, medium: "Oil on canvas", size: "90 × 120 cm", year: 2024,
    story: "A weekend painter's first big piece, made in the evenings after shipping code all day.",
    photos: ["paintingWoman", "studioEasel"], seller: "kwame", stock: 1, unique: true, tags: ["painting", "original"], status: "published", createdAt: d(17),
  },
];

/* ---------- Helpers ---------- */
export const productById = (id: string, extra: Product[] = []) => extra.find((p) => p.id === id) ?? SEED_PRODUCTS.find((p) => p.id === id);

/** Pieces left after the member's own purchases (seeded products only). */
export function stockLeft(p: Product, orders: Order[]) {
  const bought = orders.filter((o) => o.productId === p.id).reduce((n, o) => n + o.qty, 0);
  return Math.max(0, p.stock - bought);
}

export const publishedOnly = (list: Product[]) => list.filter((p) => p.status === "published");

export function sortProducts(list: Product[], sort: "new" | "low" | "high") {
  const copy = [...list];
  if (sort === "low") copy.sort((a, b) => a.price - b.price);
  else if (sort === "high") copy.sort((a, b) => b.price - a.price);
  else copy.sort((a, b) => b.createdAt - a.createdAt);
  return copy;
}

export function matchesQuery(p: Product, q: string, sellerName: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return [p.title, p.category, p.medium, sellerName, ...p.tags].some((t) => t.toLowerCase().includes(s));
}

export const cheapestShipping = SHIPPING.standard.cost;

/* ---------- Demo data (used by ?demo= params, never written to storage) ---------- */
export const DEMO_STORE: StoreProfile = {
  name: "Amara's Corner",
  tagline: "Design help, supper-club seats and a few small things I make",
  categories: ["Services", "Food", "Home"],
  city: "Lagos",
  cover: "talkCafe",
  about: "I design apps for a living and host a Sunday supper for people new to Lagos. Here you can book an hour of design help, a seat at the table, or something small I made.",
  createdAt: d(30),
};

export const DEMO_PRODUCTS: Product[] = [
  { id: "demo-harmattan-print", title: "1-hour design review", category: "Services", price: 40, medium: "Video call and written notes", size: "60 minutes", year: 2026, story: "Bring an app, a website or a pitch. I'll review the design with you and leave clear next steps.", photos: ["studioBusy", "talkTwo"], seller: "amara", stock: 6, unique: false, tags: ["design", "review"], status: "published", createdAt: d(3) },
  { id: "demo-beaded-hour", title: "Sunday supper seat", category: "Food", price: 15, medium: "Three courses, one long table", size: "1 seat", year: 2026, story: "A seat at my Sunday supper for people new to the city. Strangers in, friends out.", photos: ["talkCafe", "talkLaugh"], seller: "amara", stock: 10, unique: false, tags: ["supper", "community"], status: "published", createdAt: d(5) },
  { id: "demo-tea-bowl", title: "Tea bowl, first attempt", category: "Home", price: 20, medium: "Hand-built earthenware", size: "10 cm across", year: 2026, story: "My first bowl that held tea without weeping. Slightly wonky, entirely loved.", photos: ["clayBowl"], seller: "amara", stock: 0, unique: true, tags: ["handmade"], status: "published", createdAt: d(8) },
  { id: "demo-draft-necklace", title: "Portfolio starter kit", category: "Services", price: 25, medium: "Templates and a 20-minute call", size: "Digital", year: 2026, story: "", photos: ["journalOpen"], seller: "amara", stock: 20, unique: false, tags: [], status: "draft", createdAt: d(1) },
];

const ship = (name: string, city: string, country: string) => ({ name, address: "12 Sample Street", city, country });

/** Made-up incoming orders shown as samples so the seller side is never empty. */
export function sampleSales(product?: Pick<Product, "id" | "title" | "photos" | "price">): Order[] {
  const p = product ?? { id: "sample", title: "Sample: your first listing", photos: ["talkCafe"] as PhotoKey[], price: 90 };
  const mk = (n: number, buyer: string, qty: number, status: OrderStatus, days: number, delivery: Delivery, where: [string, string]): Order => ({
    id: `sale-${p.id}-${n}`, number: `AC-${20410 + n * 37}`, productId: p.id, title: p.title, photo: p.photos[0], seller: "amara", qty, unitPrice: p.price,
    shipping: SHIPPING[delivery].cost, total: p.price * qty + SHIPPING[delivery].cost, status, placedAt: d(days), delivery, payment: n % 2 ? "card" : "mobile", buyer,
    ship: ship(buyer, where[0], where[1]), sample: true,
  });
  return [
    mk(1, "Leila Benali", 1, "paid", 1, "standard", ["Casablanca", "Morocco"]),
    mk(2, "Zuri Nwosu", 2, "shipped", 4, "express", ["London", "United Kingdom"]),
    mk(3, "Chidi Eze", 1, "delivered", 9, "standard", ["Enugu", "Nigeria"]),
  ];
}

export function demoPurchases(): Order[] {
  const p1 = SEED_PRODUCTS[1];
  const p2 = SEED_PRODUCTS[12];
  const mk = (n: number, p: Product, status: OrderStatus, days: number): Order => ({
    id: `demo-order-${n}`, number: `AC-${31820 + n * 19}`, productId: p.id, title: p.title, photo: p.photos[0], seller: p.seller, qty: 1, unitPrice: p.price,
    shipping: SHIPPING.standard.cost, total: p.price + SHIPPING.standard.cost, status, placedAt: d(days), delivery: "standard", payment: "card", buyer: "Amara Okafor",
    ship: { name: "Amara Okafor", address: "14 Adeola Odeku Street", city: "Lagos", country: "Nigeria" },
  });
  return [mk(1, p1, "shipped", 3), mk(2, p2, "delivered", 16)];
}

/** Timestamp for things the member creates: always newer than the seeded catalogue. */
export const nowStamp = () => Math.max(Date.now(), d(0) + 1);
