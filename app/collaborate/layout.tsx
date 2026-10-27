import CollabNotice from "@/components/collab/Notice";

export default function CollaborateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<CollabNotice /></>;
}
