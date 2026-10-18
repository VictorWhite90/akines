import { redirect } from "next/navigation";

/** Starting a Banter happens on one screen, at the top of /banter. */
export default function NewBanterPage() {
  redirect("/banter#start");
}
