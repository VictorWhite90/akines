import type { PersonId } from "./people";

export type Comment = { by: PersonId; text: string; at: string };

/** A few seeded replies for posts that already show a reply count, so opening comments never feels empty. */
export const COMMENTS: Record<string, Comment[]> = {
  p1: [
    { by: "kwame", text: "This is why I love nurses. Days like this make up for the rest.", at: "1h" },
    { by: "leila", text: "Jollof as a thank-you is the best review there is.", at: "45m" },
  ],
  p2: [
    { by: "zuri", text: "I can teach HTML and CSS on Saturdays. Count me in.", at: "3h" },
    { by: "nandi", text: "This is exactly the kind of thing Lagos needs.", at: "2h" },
    { by: "wanjiru", text: "Happy to take photos for the first session.", at: "1h" },
  ],
  p3: [
    { by: "nandi", text: "I told mine I help people use their phones. She was satisfied.", at: "5h" },
    { by: "efua", text: "Such an honest question. I don't think there's a clean answer.", at: "4h" },
  ],
  p6: [
    { by: "ayo", text: "Half-marathon! That's the kind of discipline I need to learn.", at: "Yesterday" },
  ],
  p8: [
    { by: "leila", text: "I priced my first catering job too low and regretted it for a year. Happy to talk through numbers.", at: "20h" },
  ],
  p9: [
    { by: "chidi", text: "\"Gaps and all\" — writing that down.", at: "1 day ago" },
    { by: "amara", text: "This is the CV I keep coming back to. Glad you told the real story.", at: "1 day ago" },
  ],
  p11: [
    { by: "leila", text: "Take the role where you'll learn. The money catches up.", at: "3 days ago" },
  ],
};

export const commentsFor = (postId: string) => COMMENTS[postId] ?? [];
