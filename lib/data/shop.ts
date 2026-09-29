import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* ---------- Types ---------- */
export const CATEGORIES = ["Painting", "Sculpture", "Textile", "Fashion", "Ceramics", "Photography", "Beadwork", "Prints"] as const;
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
  "paintingWoman", "paintingDancers", "paintingHand", "collabArt", "studioEasel", "frameWall",
  "clayVases", "clayBowl", "clayHands", "clayBrown", "clayWheelTop", "clayWet",
  "bronzeHead", "woodFigure", "woodFigureB", "stoneBoy", "carvedGroup", "carvedRelief",
  "textileStack", "textileRolls", "textileHang", "waxPrint", "circleIndigo", "yellowPrint",
  "kenteVest", "headwrapOrange", "redPatterned", "fanGold", "blueOutfits", "beadsRed",
  "beadsPile", "beadsHung", "beadsGold", "photoAlbum", "galleryHall", "galleryTwo",
];
export const COVER_CHOICES: PhotoKey[] = ["studioBusy", "textileStack", "clayVases", "galleryModern", "beadsShop", "studioEasel", "waxPrint", "frameWall"];

/* ---------- Seeded products by the fictional artists ---------- */
const d = (daysAgo: number) => Date.UTC(2026, 8, 24) - daysAgo * 86400000;

export const SEED_PRODUCTS: Product[] = [
  {
    id: "indigo-room", title: "Indigo Room", category: "Painting", price: 1900, medium: "Oil and indigo pigment on linen", size: "90 × 120 cm", year: 2024,
    story: "I grew up smelling my grandmother's dye yard before I remember her face. This is the room I keep returning to in my head. The third layer killed it, so I scraped back to the second and left the damage showing. That is the painting now.",
    photos: ["paintingWoman", "paintingHand", "studioEasel", "brushes"], seller: "kwame", stock: 1, unique: true, tags: ["indigo", "memory", "portrait", "oil"], status: "published",
    shipping: "Crated and insured. Ships from Accra in about 10 days.", createdAt: d(2),
  },
  {
    id: "firing-day-vase", title: "Firing Day vase", category: "Ceramics", price: 240, medium: "Stoneware, ash glaze", size: "34 cm tall", year: 2025,
    story: "Made the morning of a firing, when the kiln is still warm and everyone in the yard is quiet. The ash glaze ran a little on one side, which I decided to keep.",
    photos: ["clayVases", "clayBrown", "clayHands"], seller: "thandi", stock: 3, unique: false, tags: ["vase", "stoneware", "kitchen table"], status: "published", createdAt: d(1),
  },
  {
    id: "everyday-bowl-set", title: "Everyday bowls, set of two", category: "Ceramics", price: 85, medium: "Wheel-thrown stoneware", size: "14 cm across, each", year: 2025,
    story: "Twelve years of throwing the same bowl. These two are for soup, cereal, or nothing at all. Every one is a little different, so yours will be its own.",
    photos: ["clayBowl", "clayWheelTop", "clayWet"], seller: "thandi", stock: 8, unique: false, tags: ["bowl", "daily use", "set"], status: "published", createdAt: d(6),
  },
  {
    id: "watching-figure", title: "The Watching Figure", category: "Sculpture", price: 3200, medium: "Bronze on stone base", size: "48 cm tall", year: 2024,
    story: "A figure that looks back at whoever is looking. I made the clay original in one long week, then had it cast. It sits well on a low shelf, at eye level with a seated guest.",
    photos: ["bronzeHead", "woodFigure", "stoneBoy"], seller: "tunde", stock: 1, unique: true, tags: ["bronze", "figure", "original"], status: "published", shipping: "Ships from Lagos in a padded crate, insured.", createdAt: d(3),
  },
  {
    id: "listening-boy", title: "Listening Boy", category: "Sculpture", price: 720, medium: "Carved wood, natural oil finish", size: "38 cm tall", year: 2025,
    story: "Carved from a single piece of wood a neighbour was about to burn. I followed the grain, and the boy's head tilted on its own.",
    photos: ["woodFigureB", "woodFigure", "carvedGroup"], seller: "tunde", stock: 1, unique: true, tags: ["wood", "figure", "carved"], status: "published", createdAt: d(9),
  },
  {
    id: "adire-panel-7", title: "Adire panel no. 7", category: "Textile", price: 640, medium: "Indigo resist-dyed cotton", size: "110 × 140 cm", year: 2025,
    story: "Seven dye baths, one green surprise. I planned to be annoyed, then hung it in the yard and watched the light change it for an hour. Patience is staying interested while the cloth decides.",
    photos: ["textileHang", "circleIndigo", "textileRolls", "textileStack"], seller: "ayo", stock: 1, unique: true, tags: ["indigo", "adire", "wall hanging"], status: "published", createdAt: d(4),
  },
  {
    id: "indigo-throw", title: "Indigo throw", category: "Textile", price: 180, medium: "Hand-dyed cotton", size: "130 × 170 cm", year: 2025,
    story: "A softer, everyday cousin of my wall panels. It gets better every time it is washed. Made in small batches, so the pattern changes a little each time.",
    photos: ["textileStack", "textileRolls", "waxPrint"], seller: "ayo", stock: 6, unique: false, tags: ["throw", "indigo", "home"], status: "published", createdAt: d(11),
  },
  {
    id: "harmattan-dancers", title: "Dancers at the Harmattan", category: "Painting", price: 1350, medium: "Acrylic on canvas", size: "80 × 100 cm", year: 2025,
    story: "Painted from a wedding I watched from the back of a courtyard. I wanted the movement, not the faces, so the figures blur into one long ribbon of colour.",
    photos: ["paintingDancers", "collabArt", "frameWall"], seller: "kwame", stock: 1, unique: true, tags: ["dance", "colour", "acrylic"], status: "published", createdAt: d(7),
  },
  {
    id: "sunday-wrap-jacket", title: "Sunday wrap jacket", category: "Fashion", price: 320, medium: "Cotton wax print, hand-finished seams", size: "Sizes S to XL", year: 2026,
    story: "Cut to move with you, from the market to the dinner table. The wax print comes from a small mill I have worked with for years. Made to order in your size.",
    photos: ["waxPrint", "yellowPrint", "blueOutfits"], seller: "fatou", stock: 10, unique: false, tags: ["jacket", "wax print", "made to order"], status: "published", shipping: "Made to order. Allow 2 to 3 weeks before it ships.", createdAt: d(5),
  },
  {
    id: "orange-headwrap", title: "Sunrise headwrap", category: "Fashion", price: 60, medium: "Cotton, hand-hemmed", size: "One size, 180 cm long", year: 2026,
    story: "The colour of the sky over Dakar at half past six. I put a little wire in the hem so it holds a shape without pins.",
    photos: ["headwrapOrange", "redPatterned", "fanGold"], seller: "fatou", stock: 14, unique: false, tags: ["headwrap", "accessory", "gift"], status: "published", createdAt: d(13),
  },
  {
    id: "kente-vest", title: "Woven strip vest", category: "Fashion", price: 210, medium: "Hand-woven strip cloth", size: "Sizes S to L", year: 2025,
    story: "Strips woven on a narrow loom, then sewn edge to edge into a vest that goes over almost anything. Each strip is chosen by hand so no two vests match.",
    photos: ["kenteVest", "blueOutfits", "redPatterned"], seller: "fatou", stock: 4, unique: false, tags: ["vest", "woven", "strip cloth"], status: "published", createdAt: d(17),
  },
  {
    id: "what-we-keep-print", title: "What we keep in our pockets", category: "Photography", price: 150, medium: "Archival pigment print, edition of 25", size: "40 × 50 cm", year: 2024,
    story: "From a series where I asked strangers to empty their pockets and photographed what they kept. A key, a folded prayer, half a comb. This one is number 12 of 25.",
    photos: ["photoAlbum", "galleryHall", "galleryTwo"], seller: "wanjiru", stock: 6, unique: false, tags: ["edition", "documentary", "print"], status: "published", shipping: "Ships rolled in a tube, unframed.", createdAt: d(8),
  },
  {
    id: "quiet-hall-photo", title: "The hall after closing", category: "Photography", price: 280, medium: "Silver gelatin print, framed", size: "50 × 70 cm", year: 2023,
    story: "Taken after the last visitor left a small gallery in Nairobi. The floor still holds the day. Framed in plain oak, ready to hang.",
    photos: ["galleryHall", "gallerySeated", "galleryViewer"], seller: "wanjiru", stock: 2, unique: false, tags: ["framed", "black and white", "gallery"], status: "published", createdAt: d(20),
  },
  {
    id: "red-bead-necklace", title: "Red bead collar", category: "Beadwork", price: 130, medium: "Glass beads, waxed cotton", size: "42 cm, adjustable", year: 2026,
    story: "Strung by hand over three evenings. The red is a deep, warm one that looks different in every light. It closes with a knotted cord so it never snags.",
    photos: ["beadsRed", "beadsPile", "beadsGold"], seller: "nandi", stock: 5, unique: false, tags: ["necklace", "glass beads", "gift"], status: "published", createdAt: d(10),
  },
  {
    id: "gold-bead-strand", title: "Gold strand, wall or wrist", category: "Beadwork", price: 95, medium: "Glass and brass beads", size: "Wraps twice, 90 cm", year: 2026,
    story: "Wear it wrapped around your wrist, or hang it by a window where it catches morning light. I make these while I host rooms, one bead at a time.",
    photos: ["beadsGold", "beadsHung", "beadsShop"], seller: "nandi", stock: 7, unique: false, tags: ["bracelet", "brass", "home"], status: "published", createdAt: d(15),
  },
  {
    id: "cloth-and-memory-print", title: "Cloth and Memory, risograph", category: "Prints", price: 70, medium: "Two-colour risograph on cotton paper", size: "A3, unframed", year: 2025,
    story: "Made for a small group show in Accra, in indigo and a warm yellow. It comes signed and numbered, in an edition of 60.",
    photos: ["frameWall", "collabArt", "paintingHand"], seller: "kwame", stock: 40, unique: false, tags: ["riso", "signed", "edition"], status: "published", shipping: "Ships flat in a card sleeve.", createdAt: d(12),
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
  tagline: "Small prints, beads and objects from a collector's shelf",
  categories: ["Prints", "Beadwork", "Ceramics"],
  city: "Lagos",
  cover: "galleryModern",
  about: "I started collecting to keep company with art, and ended up making a few small things myself. Everything here is made in limited runs and packed by hand.",
  createdAt: d(30),
};

export const DEMO_PRODUCTS: Product[] = [
  { id: "demo-harmattan-print", title: "Harmattan light, framed print", category: "Prints", price: 120, medium: "Giclée print, oak frame", size: "30 × 40 cm", year: 2026, story: "The dry season light that comes through my window in the last week of December. Printed on cotton rag paper.", photos: ["galleryTwo", "frameWall"], seller: "amara", stock: 12, unique: false, tags: ["print", "framed"], status: "published", createdAt: d(5) },
  { id: "demo-beaded-hour", title: "Beaded hour bracelet", category: "Beadwork", price: 48, medium: "Glass beads, elastic cord", size: "One size", year: 2026, story: "Made on evenings when I could not sleep. Each colour is a different hour.", photos: ["beadsPile", "beadsRed"], seller: "amara", stock: 9, unique: false, tags: ["bracelet"], status: "published", createdAt: d(3) },
  { id: "demo-tea-bowl", title: "Tea bowl, first attempt", category: "Ceramics", price: 36, medium: "Hand-built earthenware", size: "10 cm across", year: 2026, story: "My first bowl that held tea without weeping. Slightly wonky, entirely loved.", photos: ["clayBowl"], seller: "amara", stock: 0, unique: true, tags: ["bowl"], status: "published", createdAt: d(2) },
  { id: "demo-draft-necklace", title: "Coral morning necklace", category: "Beadwork", price: 75, medium: "Glass beads, waxed cotton", size: "44 cm", year: 2026, story: "", photos: ["beadsHung"], seller: "amara", stock: 4, unique: false, tags: [], status: "draft", createdAt: d(1) },
];

const ship = (name: string, city: string, country: string) => ({ name, address: "12 Sample Street", city, country });

/** Made-up incoming orders shown as samples so the seller side is never empty. */
export function sampleSales(product?: Pick<Product, "id" | "title" | "photos" | "price">): Order[] {
  const p = product ?? { id: "sample", title: "Sample: your first piece", photos: ["galleryTwo"] as PhotoKey[], price: 90 };
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
