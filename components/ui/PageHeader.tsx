export default function PageHeader({ eyebrow, title, sub, children }: { eyebrow: string; title: React.ReactNode; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-3xl">
        <p className="eyebrow text-clay-600">{eyebrow}</p>
        <h1 className="font-display mt-2 text-[38px] leading-[1.05] md:text-[48px]">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-mute">{sub}</p>}
      </div>
      {children}
    </header>
  );
}
