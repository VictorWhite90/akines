import { redirect } from "next/navigation";

/** The old prototype welcome screen. Visitors now meet About Akines first. */
export default function WelcomePage() {
  redirect("/about");
}
