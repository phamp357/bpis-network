// Central nav config — add items here to surface them in the sidebar.
// Phase labels show which build phase owns each route.

export type NavItem = {
  label: string;
  href: string;
  phase: number;
  description: string;
  group: "core" | "agents" | "deals" | "network" | "library";
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    phase: 1,
    description: "Operator overview",
    group: "core",
  },
  {
    label: "Analytics",
    href: "/analytics",
    phase: 9,
    description: "Funnel, pipeline, and activity feed",
    group: "core",
  },
  {
    label: "ORACLE",
    href: "/oracle",
    phase: 4,
    description: "Client activation profile generator",
    group: "agents",
  },
  {
    label: "COVENANT",
    href: "/covenant",
    phase: 5,
    description: "Legal package selector",
    group: "agents",
  },
  {
    label: "Intelligence Suite",
    href: "/intelligence-suite",
    phase: 6,
    description: "Content, objections, prospect intel",
    group: "agents",
  },
  {
    label: "Command Dashboard",
    href: "/command-dashboard",
    phase: 8,
    description: "Deal pipeline & 5-phase workflow",
    group: "deals",
  },
  {
    label: "UCC Wealth Engine",
    href: "/ucc-wealth-engine",
    phase: 8,
    description: "Deal analysis & capital structuring",
    group: "deals",
  },
  {
    label: "IUL Partners",
    href: "/iul-partners",
    phase: 7,
    description: "Advisor network & vetting",
    group: "network",
  },
  {
    label: "Kingdom Strategy",
    href: "/kingdom-strategy",
    phase: 3,
    description: "Spiritual, human, applied intelligence",
    group: "library",
  },
  {
    label: "IUL Framework",
    href: "/iul-framework",
    phase: 3,
    description: "Partner & education reference",
    group: "library",
  },
];

export const NAV_GROUPS: Record<NavItem["group"], string> = {
  core: "Overview",
  agents: "Agents",
  deals: "Deal Workspace",
  network: "Partner Network",
  library: "Library",
};
