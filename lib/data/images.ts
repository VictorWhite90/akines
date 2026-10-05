/**
 * Stock photography (Unsplash) standing in for real Akines content.
 * Every photo here was checked by eye; keys say what the picture shows so
 * pages can pick by subject. People are fictional and the portraits are
 * models, not the artists named beside them.
 */
export type Photo = { src: string; alt: string };

const u = (id: string, alt: string): Photo => ({ src: `https://images.unsplash.com/photo-${id}`, alt });
const raw = (src: string, alt: string): Photo => ({ src, alt });

export const PHOTO = {
  // Photos used by the approved reference design
  heroStudio: raw("https://a.storyblok.com/f/119968/1200x1600/2208abd25f/christian-luiten-avant-arte-isshaq-001.jpg", "An artist working in a colourful studio"),
  kincircleHero: raw("/kincirclebg.png", "Five creatives gathered around a laptop and a spread of prints, deep in conversation"),
  collabArt: u("1579783902614-a3fb3927b6a5", "Colourful contemporary artwork"),
  exhibitionAfrican: raw("https://www.meer.com/attachments/e5187f686f05a7feaa33428247aa795c6b03f338/store/fill/1860/1395/3a905f1e862b811f7636a07a57c47b9c6218b56531fffafde5f06d6f7d13/In-Our-Days-by-Oluwole-Omofemi-at-Signature-African-Art-London-Photo-c-Mora-Ltd.jpg", "A contemporary African art exhibition"),
  galleryModern: raw("https://artlogic-res.cloudinary.com/w_2400%2Ch_2400%2Cc_limit%2Cf_auto%2Cfl_lossy%2Cq_auto/ws-artlogicwebsite1562/usr/library/images/main/pages/23/0028.jpg", "A modern African art gallery"),
  photoAlbum: u("1528569937393-ee892b976859", "Hands turning the pages of an old black-and-white photo album"),
  circleInner: u("1549490349-8643362247b5", "Abstract purple and pink painting"),
  circleIndigo: u("1577083552431-6e5fd01aa342", "Textured painted figures in earthy tones"),

  // Textiles & fashion
  textileStack: u("1768212565424-efa3a3852b81", "Stacked African wax-print fabrics in green, gold and blue"),
  textileRolls: u("1578509566163-068acd11b8e7", "Rolls of multicoloured African textiles"),
  textileHang: u("1768212566108-4ce4f329e4d2", "Hand-dyed cloths hanging in orange, red and gold"),
  waxPrint: u("1784123476742-de48239d2fb0", "A woman in a blue wax-print skirt with butterfly motifs"),
  kenteVest: u("1720343354398-89c6aa6d12a4", "A woman in a gold kente vest and bantu knots against a green wall"),
  headwrapOrange: u("1696962678565-bee84e6b9cb6", "A woman in a printed dress and headwrap against an orange wall"),
  redPatterned: u("1625646741211-711bdd65c570", "A woman in a red patterned robe and gold hoop jewellery"),
  fanGold: u("1708170236215-b6edcad7f49a", "A woman with braids holding a golden fan"),
  yellowPrint: u("1709809081557-78f803ce93a0", "A woman in a yellow print dress seated among woven baskets"),
  blueOutfits: u("1485570661444-73b3f0ff9d2f", "Two women in matching blue print outfits walking"),

  // Studio & painting
  studioEasel: u("1740710543611-80b658171bc3", "A bright studio corner with an easel, brushes and a stool"),
  paintingHand: u("1644375391877-0ae77eeed8fc", "A hand painting on a canvas at an easel"),
  brushes: u("1613746203812-717e6e5db3da", "Paint brushes in a glass jar"),
  studioDim: u("1614244139209-53c071a4737d", "A dim studio with a person seated among canvases"),
  studioBusy: u("1676742663664-2da16ddcad7a", "A crowded studio with paintings and furniture"),
  paintingDancers: u("1728827894907-7e6e07c644f7", "A painting of three figures dancing in a vibrant abstract landscape"),
  paintingWoman: u("1741805190372-26d5e8130aae", "A painted portrait of a woman with a floral hair accessory"),

  // Clay & sculpture
  clayVases: u("1597696929736-6d13bed8e6a8", "Ceramic vases in neutral tones on a wooden surface"),
  clayHands: u("1590605095243-072811dbe64c", "Hands shaping a white clay pot"),
  clayWheelTop: u("1609881583302-61548332039c", "A potter's hands on a wheel, seen from above"),
  clayBowl: u("1607556671927-78a6605e290b", "A person forming a clay bowl on a turntable"),
  clayWet: u("1589051088132-06f36a22012a", "Hands wet with grey clay shaping the rim of a bowl"),
  clayBrown: u("1520408222757-6f9f95d87d5d", "Brown clay vases arranged on a table"),
  stoneBoy: u("1542775846-e6c1e8aba884", "A carved stone bust of a boy"),
  woodFigure: u("1696586904897-aa8590c88f92", "A wooden statue of a seated figure"),
  woodFigureB: u("1696586904914-075bb15acc40", "A carved wooden figure on a chair"),
  carvedGroup: u("1695142258321-9cf8775a0e30", "Small carved figures arranged on a table"),
  carvedRelief: u("1765969934638-11de974762b2", "An intricate wooden carving of figures and a ship"),
  bronzeHead: u("1784908413710-1f67e54313e5", "An ancient bronze head with a tall conical headdress"),
  tribalCarving: u("1760133560453-db72f4074058", "Carved wooden figures in black and white"),

  // Galleries & living with art
  galleryViewer: u("1606819717115-9159c900370b", "A visitor in a black coat standing before a wall of paintings"),
  galleryGroup: u("1569783721854-33a99b4c0bae", "Visitors standing before a large painting in a gallery"),
  gallerySeated: u("1582555172866-f73bb12a2ab3", "A woman sitting on a gallery floor looking at framed works"),
  frameWall: u("1565799515768-2dcfd834625c", "A loveseat beneath a wall of framed pictures"),
  galleryHall: u("1735605917461-4c1b77a6616f", "A long gallery hall hung with paintings"),
  galleryTwo: u("1680226312080-c3f9beff02ca", "A woman looking at paintings on a gallery wall"),

  // Journals & writing
  journalOpen: u("1579017308347-e53e0d2fc5e9", "A woman writing in a notebook with a pen"),
  journalPen: u("1517971071642-34a2d3ecc9cd", "A hand writing on paper with a pen"),
  journalWindow: u("1517971129774-8a2b38fa128e", "A woman writing in a book at a table by a window"),
  journalCoffee: u("1637689113621-73951984fcc1", "A cup of coffee beside a closed notebook on a wooden table"),
  journalBed: u("1653569746987-8c1c63b2ffe2", "An open book resting on a bed beside a pencil"),
  notebookWhite: u("1586380951230-e6703d9f6833", "A white notebook on a soft white cloth"),

  // Beads
  beadsRed: u("1629481995102-ff98d306dd8a", "A red, green and yellow beaded necklace"),
  beadsPile: u("1560847133-e6f64dc352ea", "Beads of assorted colours piled together"),
  beadsHung: u("1574362098421-38623a3466b5", "Beaded necklaces hanging in rows"),
  beadsGold: u("1613274146063-8930e164c743", "A blue and gold beaded bracelet"),
  beadsShop: u("1760726743536-019e9e2b06b8", "Colourful beaded necklaces hanging outside a shop"),

  // Calm & wellbeing
  calmSilhouette: u("1506126613408-eca07ce68773", "A person meditating in warm evening light"),
  calmBench: u("1522075782449-e45a34f1ddfb", "A woman sitting on a bench looking out over mountains"),
  calmWater: u("1526779259212-939e64788e3c", "A man sitting on a rock surrounded by still water"),

  // Conversation
  talkMugs: u("1604881988758-f76ad2f7aac1", "Two people holding grey mugs at a table"),
  talkTwo: u("1513470270416-d3ff6f16b22f", "Two women facing each other across a table by a glass wall"),
  talkGroup: u("1604881989793-466aca8dd319", "A group of people gathered around a white table"),
  talkCafe: u("1699730148132-1409a3728479", "A group sharing food and drinks around a table"),
  talkLaugh: u("1582298537624-c6a00f906e51", "Friends sitting around a wooden table, talking"),
  talkYoung: u("1760623681430-9224e69d9683", "Two young women talking at a cafe table"),
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTO;

/** Portrait models for the fictional members. */
export const FACE = {
  w1: u("1593351799227-75df2026356b", "Portrait of a woman with a flower at her ear"),
  amaraFace: u("1534528741775-53994a69daeb", "Portrait of a woman"),
  ayoFace: u("1531123897727-8f129e1688ce", "Portrait of a woman"),
  kwameFace: u("1506794778202-cad84cf45f1d", "Portrait of a man"),
  leilaFace: u("1580489944761-15a19d654956", "Portrait of a woman"),
  mayaFace: u("1494790108377-be9c29b29330", "Portrait of a woman"),
  maleFace: u("1500648767791-00dcc994a43e", "Portrait of a man"),
  faceFour: u("1508214751196-bcfd4ca60f91", "Portrait of a woman"),
  w2: u("1669040084821-097235fe53ff", "Portrait of a woman with hoop earrings"),
  w3: u("1531123897727-8f129e1688ce", "Portrait of a woman holding her collar"),
  w4: u("1628682814595-a3f0816b25ff", "Portrait of a woman with short black hair"),
  w5: u("1530785602389-07594beb8b73", "Portrait of a smiling woman wearing a headwrap"),
  w6: u("1556300219-2d2fdd6266d3", "Portrait of a woman in profile"),
  w7: u("1522938974444-f12497b69347", "Portrait of a woman with glasses and long braids"),
  w8: u("1531123414780-f74242c2b052", "Portrait of a smiling woman beside a red wall"),
  w9: u("1741940365113-4c77bdc325e0", "Portrait of a woman with long braids and large earrings"),
  w10: u("1614291129226-41dae34c2128", "Portrait of a woman in a blue floral headscarf"),
  m1: u("1565884280295-98eb83e41c65", "Portrait of a man in a red shirt"),
  m2: u("1729075510531-bed3ee89bc6c", "Portrait of a man against an orange background"),
} as const satisfies Record<string, Photo>;

export type FaceKey = keyof typeof FACE;
