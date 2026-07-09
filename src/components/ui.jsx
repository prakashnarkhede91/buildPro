// ─── Color palette ───────────────────────────────────────────
export const C = {
  red: "#cc0000", redBg: "#fef2f2", redLight: "#fee2e2",
  green: "#16a34a", greenBg: "#f0fdf4",
  orange: "#ea580c", orangeBg: "#fff7ed",
  blue: "#2563eb", blueBg: "#eff6ff",
  grey: "#6b7280", greyBg: "#f9fafb",
  border: "#ebebeb", white: "#ffffff", dark: "#111111",
  text: "#374151", textLight: "#6b7280",
};

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const summaryGridClass = "mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4";
export const compactSummaryGridClass = "mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
export const wideSummaryGridClass = "mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5";

const badgeMap = {
  green: "border border-emerald-200 bg-emerald-50 text-emerald-600",
  red: "border border-red-200 bg-red-50 text-red-700",
  orange: "border border-orange-200 bg-orange-50 text-orange-600",
  blue: "border border-blue-200 bg-blue-50 text-blue-600",
  grey: "border border-neutral-200 bg-neutral-100 text-neutral-500",
  yellow: "border border-yellow-200 bg-yellow-50 text-yellow-600",
  purple: "border border-purple-200 bg-purple-50 text-purple-600",
};

const btnMap = {
  primary: "border border-red-700 bg-[blueviolet] text-white hover:bg-red-800",
  outline: "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50",
  ghost: "border border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
};

const btnSizeMap = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-[13px]",
};

const progressColorMap = {
  [C.red]: "bg-[blueviolet]",
  [C.green]: "bg-emerald-600",
  [C.orange]: "bg-orange-600",
  [C.blue]: "bg-blue-600",
  ["#888"]: "bg-neutral-500",
  ["#9333ea"]: "bg-purple-600",
  ["#f59e0b"]: "bg-amber-500",
  ["#e8e8e8"]: "bg-neutral-200",
};

const formGridMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
};

const fieldSpanMap = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-2 xl:col-span-3",
  4: "md:col-span-2 xl:col-span-4",
};

const modalWidthMap = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
};

function widthToModalClass(width) {
  if (typeof width === "string") return modalWidthMap[width] || modalWidthMap.md;
  if (typeof width === "number") {
    if (width >= 720) return modalWidthMap.lg;
    if (width <= 480) return modalWidthMap.sm;
  }
  return modalWidthMap.md;
}

export function StatCard({ label, value, icon, iconBg, sub, subColor, className = "", valueClassName = "" }) {
  return (
    <div className={cn("rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-neutral-500">{label}</div>
          <div className={cn("text-2xl font-bold leading-none text-neutral-900 sm:text-[26px]", valueClassName)}>{value}</div>
          {sub && <div className="text-[11px] font-medium" style={{ color: subColor || C.green }}>{sub}</div>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100" style={iconBg ? { background: iconBg } : undefined}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function SummaryStat({ label, value, colorClass = "text-neutral-900", sub, subClass = "text-neutral-400" }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="text-[11px] font-medium text-neutral-500">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold leading-none sm:text-[22px]", colorClass)}>{value}</div>
      {sub && <div className={cn("mt-1 text-[11px] font-medium", subClass)}>{sub}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={cn("rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5", className)}>{children}</div>;
}

export function SectionHead({ title, children, className = "" }) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function Badge({ children, color = "grey", className = "" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", badgeMap[color] || badgeMap.grey, className)}>
      {children}
    </span>
  );
}

export function Table({ headers, children, className = "", tableClassName = "" }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn("min-w-full border-collapse", tableClassName)}>
        <thead>
          <tr className="border-b border-neutral-200">
            {headers.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3.5 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500">
                {h}
                {h && <span className="ml-1 opacity-40">◇</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children, onClick, className = "" }) {
  return (
    <tr onClick={onClick} className={cn("border-b border-neutral-100 transition-colors hover:bg-neutral-50", onClick && "cursor-pointer", className)}>
      {children}
    </tr>
  );
}

export function TD({ children, className = "", style }) {
  return (
    <td className={cn("px-3.5 py-3 text-[13px] text-neutral-700", className)} style={style}>
      {children}
    </td>
  );
}

export function Btn({ children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled = false, ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70",
        btnSizeMap[size] || btnSizeMap.md,
        btnMap[variant] || btnMap.primary,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const inputClass = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100";

export function Input({ className = "", ...props }) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Select({ children, className = "", ...props }) {
  return <select className={cn(inputClass, "cursor-pointer", className)} {...props}>{children}</select>;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={cn(inputClass, "min-h-20 resize-y", className)} {...props} />;
}

export function FG({ label, children, span = 1, className = "" }) {
  return (
    <div className={cn("flex flex-col gap-1.5", fieldSpanMap[span] || fieldSpanMap[1], className)}>
      <label className="text-xs font-medium text-neutral-600">{label}</label>
      {children}
    </div>
  );
}

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn("max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7", widthToModalClass(width))}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="text-lg font-bold text-neutral-900">{title}</div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500 transition hover:bg-neutral-200">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName = "",
  onConfirm,
  onClose,
  loading = false,
  children,
}) {
  return (
    <Modal title={title} onClose={loading ? undefined : onClose} width="sm">
      <div className="space-y-4">
        <div className="text-sm text-neutral-600">{message}</div>
        {children}
        <div className="flex justify-end gap-2">
          <Btn variant="outline" onClick={onClose} disabled={loading}>{cancelText}</Btn>
          <Btn onClick={onConfirm} disabled={loading} className={confirmClassName}>{loading ? "Please wait..." : confirmText}</Btn>
        </div>
      </div>
    </Modal>
  );
}

export function FormGrid({ children, cols = 2, className = "" }) {
  return <div className={cn("grid gap-4", formGridMap[cols] || formGridMap[2], className)}>{children}</div>;
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="text-lg font-bold text-neutral-900">{title}</div>
        {sub && <div className="mt-1 text-sm text-neutral-500">{sub}</div>}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function Progress({ pct, color = "#cc0000", height = 6, className = "" }) {
  const hClass = height >= 10 ? "h-2.5" : height >= 8 ? "h-2" : "h-1.5";
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-neutral-200", hClass, className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", progressColorMap[color] || "bg-[blueviolet]")}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export function ActionBtns({ onView, onEdit, onDelete, onWhatsApp, onAddUnit, onAddTower }) {
  return (
    <div className="flex items-center gap-1.5">
      {onView && (
        <button title="View" onClick={onView} className="rounded-md p-1 text-sky-600 transition hover:bg-sky-50">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}
      {onWhatsApp && (
        <button title="WhatsApp" onClick={onWhatsApp} className="rounded-md p-1 text-[#25d366] transition hover:bg-emerald-50">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </button>
      )}
      {onAddUnit && (
        <button title="Units" onClick={onAddUnit} className="rounded-md p-1 text-blue-600 transition hover:bg-blue-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22h18" />
            <path d="M5 22V8l7-4 7 4v14" />
            <path d="M9 14h6" />
            <path d="M12 11v6" />
          </svg>
        </button>
      )}
      {onAddTower && (
        <button title="Towers" onClick={onAddTower} className="rounded-md p-1 text-violet-600 transition hover:bg-violet-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 22h18" />
            <path d="M6 22V4h5v18" />
            <path d="M13 22V8h5v14" />
            <path d="M8.5 8h1" />
            <path d="M8.5 12h1" />
            <path d="M8.5 16h1" />
            <path d="M15.5 12h1" />
            <path d="M15.5 16h1" />
          </svg>
        </button>
      )}
      {onEdit && (
        <button title="Edit" onClick={onEdit} className="rounded-md p-1 text-neutral-500 transition hover:bg-neutral-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      )}
      {onDelete && (
        <button title="Delete" onClick={onDelete} className="rounded-md p-1 text-red-700 transition hover:bg-red-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      )}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-5 flex w-full flex-wrap gap-2 rounded-2xl bg-neutral-100 p-1.5 sm:w-fit">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-medium transition sm:text-[13px]",
            active === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:bg-white/70"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export const PROJECTS = ["Kasturi Courtyard", "Green Valley Phase 2", "Sunrise Heights", "Royal Palms", "City Square"];
export const AGENTS = ["Pushpraj", "Aman", "Kumar", "Ravi", "Sneha"];
