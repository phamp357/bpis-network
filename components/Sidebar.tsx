"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NAV_GROUPS, type NavItem } from "@/lib/nav";

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  const grouped = NAV_ITEMS.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-black/30 flex flex-col print:hidden">
      <div className="p-5 border-b border-white/10">
        <div className="font-semibold tracking-tight">BPIS Network</div>
        <div className="text-xs text-white/50 mt-0.5">Operator console</div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {(Object.keys(NAV_GROUPS) as Array<keyof typeof NAV_GROUPS>).map((group) => {
          const items = grouped[group];
          if (!items?.length) return null;
          return (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-wider text-white/40 px-2 mb-1.5">
                {NAV_GROUPS[group]}
              </div>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition ${
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] text-white/30">P{item.phase}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="text-xs text-white/50 px-2 mb-2 truncate" title={userEmail}>
          {userEmail}
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full text-left px-2 py-1.5 rounded-md text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
