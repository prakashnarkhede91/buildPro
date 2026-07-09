import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Card, PageHead, SummaryStat, summaryGridClass } from "../ui";
import { initialMaterials } from "./constructionMaterialData";

const SECTION_LINKS = [
  { id: "stock-register", label: "Stock Register", to: "/construction-material/stock-register" },
  { id: "inward", label: "Inward", to: "/construction-material/inward" },
  { id: "outward", label: "Outward", to: "/construction-material/outward" },
  { id: "issue-request", label: "Issue Request", to: "/construction-material/issue-request" },
];

export default function ConstructionMaterialLayout() {
  const [mats, setMats] = useState(initialMaterials);

  return (
    <div>
      <PageHead title="Construction Material" sub="Track stock, inward / outward movement and material usage" />

      {/* <Card className="mb-4">
        <div className="flex flex-wrap gap-2">
          {SECTION_LINKS.map((link) => (
            <NavLink
              key={link.id}
              to={link.to}
              className={({ isActive }) => `rounded-xl border px-4 py-2 text-sm font-semibold transition ${isActive ? "border-red-700 bg-red-50 text-red-700" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </Card> */}

      <div className={summaryGridClass}>
        <SummaryStat label="Total Materials" value={mats.length} />
        <SummaryStat label="Low Stock" value={mats.filter((m) => m.stock <= m.min).length} colorClass="text-red-700" />
        <SummaryStat label="Total Inward (Nov)" value="18 Entries" colorClass="text-emerald-600" />
        <SummaryStat label="Total Outward (Nov)" value="12 Entries" colorClass="text-orange-600" />
      </div>

      <div className="mt-4">
        <Outlet context={{ mats, setMats }} />
      </div>
    </div>
  );
}
