import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../navigation";

const NAV_ICONS = {
  dashboard: <UserIcon />,
  master: <GridIcon />,
  purchases: <BagIcon />,
  constructionmaterial: <BuildIcon />,
  siteprogress: <SiteIcon />,
  marketing: <MktIcon />,
  hr: <HRIcon />,
  sales: <SalesIcon />,
  selffinance: <FinIcon />,
  account: <AccIcon />,
  filemanager: <FileIcon />,
  managetools: <ToolIcon />,
  reports: <RepIcon />,
};

function UserIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
function GridIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
function BagIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
function BuildIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-8 0v2"/></svg>}
function SiteIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20M6 20V10l6-7 6 7v10"/></svg>}
function MktIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>}
function HRIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
function SalesIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
function FinIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
function AccIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
function FileIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>}
function ToolIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>}
function RepIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
function MoonIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>}

export default function Sidebar({ open, onClose }) {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(() => ({ master: true }));
  const sidebarItems = useMemo(() => NAV_ITEMS, []);

  const toggleGroup = (groupId) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-neutral-950/40 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col overflow-y-auto border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-[blueviolet] px-2 py-1">
              <span className="text-[11px] font-extrabold tracking-[-0.03em] text-white">PL</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">ConstructPro</div>
              <div className="text-[11px] text-neutral-400">Operations Suite</div>
            </div>
          </div>
          <button className="rounded-lg p-1 text-neutral-500 lg:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Main</div>

        <nav className="mt-2 space-y-1 px-2 pb-4">
          {sidebarItems.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isGroupActive = hasChildren && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));
            const isGroupOpen = hasChildren && ((expandedGroups[item.id] ?? false) || isGroupActive);

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <NavLink
                    to={hasChildren ? item.children[0].path : item.path}
                    onClick={() => onClose?.()}
                    className={({ isActive }) => `flex min-w-0 flex-1 items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-left text-[13px] transition ${isActive || isGroupActive ? "border-red-700 bg-red-50 font-semibold text-red-700" : "border-transparent text-neutral-600 hover:bg-neutral-50"}`}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`shrink-0 ${(isActive || isGroupActive) ? "opacity-100" : "opacity-60"}`}>{NAV_ICONS[item.id]}</span>
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>

                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-50"
                      aria-label={`Toggle ${item.label} menu`}
                    >
                      {isGroupOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  )}
                </div>

                {hasChildren && isGroupOpen && (
                  <div className="ml-6 space-y-1 border-l border-neutral-200 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        onClick={() => onClose?.()}
                        className={({ isActive }) => `flex items-center rounded-lg px-3 py-2 text-[12px] transition ${isActive ? "bg-red-50 font-semibold text-red-700" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"}`}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* <div className="mt-auto border-t border-neutral-100 px-4 py-4">
          <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <MoonIcon />
              <span>Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-5 w-10 rounded-full transition ${darkMode ? "bg-[blueviolet]" : "bg-neutral-300"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${darkMode ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        </div> */}
      </aside>
    </>
  );
}
