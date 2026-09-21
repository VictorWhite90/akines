import type { ReactNode } from "react";

export default function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[4px] border border-dashed border-sand-300 bg-white px-6 py-12 text-center">
      {icon}
      <p className="font-playfair text-lg font-semibold text-green-950">{title}</p>
      {description && <p className="max-w-md text-sm text-grey-700">{description}</p>}
      {action}
    </div>
  );
}
