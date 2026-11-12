/**
 * Phone layout (below 768 px) of each app screen, from the product design's V2 Mobile designs (its RouteDef.mobile, set in
 * features/community/routes.tsx). We have no route registry, so the Shell looks the path up here.
 *
 * bar "main" (default): the mobile header with logo, page title and avatar. bar "top": the top bar with a back button and `title`
 * instead (sub-pages); `back` is the path the back button opens. bottomBar false hides the bottom tab bar (chat threads).
 * A page whose title comes from data (a thread, a project) sets it with <MobileTopBarTitle>; `title` here is the fallback.
 */
import { DEMO } from "@/lib/demo/mode";

export type MobileRoute = { bar?: "main" | "top"; title?: string; back?: string; bottomBar?: boolean };

const top = (title: string, back: string, bottomBar = true): MobileRoute => ({ bar: "top", title, back, bottomBar });

/** Our settings sections, titled as the Settings page titles them. */
const SETTINGS: Record<string, string> = {
  personal: "Personal details",
  security: "Password and security",
  devices: "Devices",
  blocked: "Blocked members",
  data: "Your data",
  recommendations: "Recommendation preferences",
  explanations: "Recommendation explanations",
  privacy: "Privacy settings",
  connection: "Connection preferences",
};

/** First match wins. */
const ROUTES: [RegExp, (m: RegExpExecArray) => MobileRoute][] = [
  [/^\/messages\/?$/, () => top("Messages", "/")],
  [/^\/messages\/[^/]+\/?$/, () => top("Messages", "/messages", false)],
  // the preview shows the design's two collaborations; real projects set their name with <MobileTopBarTitle>
  [/^\/community\/collaborations\/?$/, () => top(DEMO ? "Community Health Initiative" : "Collaboration", "/")],
  [/^\/community\/collaborations\/lagos-makers-zine\/?$/, () => top(DEMO ? "Lagos Makers Zine" : "Collaboration", "/")],
  [/^\/community\/collaborations\/[^/]+\/?$/, () => top("Collaboration", "/")],
  [/^\/wellbeing\/quiet\/?$/, () => top("Quiet company", "/")],
  [/^\/wellbeing\/reflect\/?$/, () => top("Reflect privately", "/")],
  [/^\/wellbeing\/support\/?$/, () => top("Find professional support", "/")],
  [/^\/settings\/?$/, () => top("Settings", "/")],
  [/^\/settings\/([^/]+)\/?$/, (m) => top(SETTINGS[m[1]!] ?? "Settings", "/settings")],
  [/^\/community\/banter\/?$/, () => top("Banter", "/")],
  [/^\/community\/banter\/[^/]+\/?$/, () => top("Banter", "/community/banter")],
];

export function mobileRoute(pathname: string): MobileRoute | undefined {
  for (const [re, make] of ROUTES) {
    const m = re.exec(pathname);
    if (m) return make(m);
  }
  return undefined;
}
