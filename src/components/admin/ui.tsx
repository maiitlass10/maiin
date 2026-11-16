/** Small form building blocks shared by the admin screens. */

export function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border border-line bg-bg p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-black">{title}</h2>
        {aside}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, htmlFor, children }: { label: string; hint?: string; error?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-xs font-semibold text-sale" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = "h-11 w-full border border-line bg-bg px-3 text-[15px] outline-none transition-colors focus:border-fg aria-[invalid=true]:border-sale";
export const areaClass = "min-h-24 w-full border border-line bg-bg p-3 text-[15px] outline-none transition-colors focus:border-fg";

export function Check({ label, checked, onChange, id }: { label: string; checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <label htmlFor={id} className="flex h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-fg" />
      {label}
    </label>
  );
}

export function Badge({ tone = "muted", children }: { tone?: "ok" | "muted" | "sale"; children: React.ReactNode }) {
  const c = tone === "ok" ? "bg-ok/10 text-ok" : tone === "sale" ? "bg-sale/10 text-sale" : "bg-soft text-muted";
  return <span className={`inline-flex h-6 items-center px-2 text-xs font-bold ${c}`}>{children}</span>;
}
