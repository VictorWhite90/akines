import BanterThread from "@/components/banter/BanterThread";

export default async function BanterClassicThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BanterThread id={id} />;
}
