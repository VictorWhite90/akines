import { redirect } from "next/navigation";

/** The old applications page lives in Collaborate now. */
export default function OldApplications() {
  redirect("/collaborate/applications");
}
