import type { PersonId } from "./people";

export type Comment = { by: PersonId; text: string; at: string };

/** A few seeded replies for posts that already show a reply count, so opening comments never feels empty. */
export const COMMENTS: Record<string, Comment[]> = {
  p1: [
    { by: "kwame", text: "That green is exactly what I've been chasing too. What did you change on the third bath?", at: "1h" },
    { by: "leila", text: "Gorgeous. The light in that yard photo is doing half the work.", at: "45m" },
  ],
  p2: [
    { by: "zuri", text: "I'd love to help research the foundries that are still active. Count me in.", at: "3h" },
    { by: "nandi", text: "This is exactly the kind of story that needs telling before it's gone.", at: "2h" },
    { by: "wanjiru", text: "Happy to shoot stills alongside if that's useful.", at: "1h" },
  ],
  p3: [
    { by: "nandi", text: "The stories we tell definitely change what we see — I think that's the whole point of a good painting.", at: "5h" },
    { by: "efua", text: "This is such an honest question. I don't think there's a clean answer.", at: "4h" },
  ],
  p6: [
    { by: "ayo", text: "Twelve years for one shape. That's the kind of patience I need to learn.", at: "Yesterday" },
  ],
  p8: [
    { by: "leila", text: "I priced my first collection too low and regretted it for a year. Happy to talk through numbers.", at: "20h" },
  ],
  p9: [
    { by: "chidi", text: "\"Finished isn't the same as true\" — writing that down.", at: "1 day ago" },
    { by: "amara", text: "This is the painting I keep coming back to. Glad you didn't paint over it.", at: "1 day ago" },
  ],
  p11: [
    { by: "leila", text: "Save for the bigger one. You'll remember waiting for it more than the wait itself.", at: "3 days ago" },
  ],
};

export const commentsFor = (postId: string) => COMMENTS[postId] ?? [];
