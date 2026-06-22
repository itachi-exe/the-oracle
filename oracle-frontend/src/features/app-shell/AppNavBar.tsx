import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Swords, FilePen, BarChart3, History, Settings, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { IdentityAvatar } from "@/components/ui/IdentityAvatar";
import { WalletStatusButton } from "@/features/wallet/WalletStatusButton";
import { useWalletStore } from "@/features/wallet/useWalletStore";
import { useAgent } from "@/features/agent/useAgent";
import { demoAddress } from "@/lib/mockData";

const navItemClass =
  "flex shrink-0 items-center gap-2 border border-line-3 bg-panel px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer hover:border-line-7 hover:bg-panel-3";

const otherNavItems = [
  { to: "/app/logger", label: "Logger", icon: FilePen },
  { to: "/app/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/app/predictions", label: "My Predictions", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const bottomTabItems = [
  { to: "/app/logger", label: "Logger", icon: FilePen },
  { to: "/app/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { to: "/app/predictions", label: "Predictions", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

/** Desktop-only: opens on hover, matches the squared card treatment used everywhere else in the nav. */
function SparNavItem() {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === "/app";

  function openNow() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  }

  function closeSoon() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  function go(query: string) {
    setOpen(false);
    navigate(`/app?${query}`);
  }

  return (
    <div onMouseEnter={openNow} onMouseLeave={closeSoon} className="relative">
      <button
        type="button"
        onClick={() => navigate("/app")}
        className={cn(navItemClass, isActive ? "border-line-7 bg-panel-3 text-ink-1" : "text-ink-6")}
        aria-expanded={open}
      >
        <Swords className="size-4" aria-hidden="true" />
        Spar
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 flex w-[200px] flex-col gap-2.5 border border-line-3 bg-panel-2 p-2.5">
          <button type="button" onClick={() => go("new=1")} className={cn(navItemClass, "w-full text-ink-2")}>
            <Plus className="size-4" aria-hidden="true" />
            New chat
          </button>
          <button type="button" onClick={() => go("resume=1")} className={cn(navItemClass, "w-full text-ink-2")}>
            <Clock className="size-4" aria-hidden="true" />
            Previous chat
          </button>
        </div>
      )}
    </div>
  );
}

/** Mobile bottom-tab equivalent of SparNavItem: tap (not hover) toggles the New/Previous chat panel, which opens upward since it sits in a bottom bar. */
function MobileSparTab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === "/app";

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleTap() {
    if (!isActive) {
      navigate("/app");
      return;
    }
    setOpen((v) => !v);
  }

  function go(query: string) {
    setOpen(false);
    navigate(`/app?${query}`);
  }

  return (
    <div ref={ref} className="relative flex flex-1">
      <button
        type="button"
        onClick={handleTap}
        aria-expanded={open}
        className={cn("flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px]", isActive ? "text-ink-1" : "text-ink-6")}
      >
        <Swords className="size-5" aria-hidden="true" />
        Spar
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 flex w-[180px] flex-col gap-2 border border-line-3 bg-panel-2 p-2.5">
          <button
            type="button"
            onClick={() => go("new=1")}
            className="flex w-full items-center gap-2 border border-line-3 bg-panel px-3 py-2.5 text-sm text-ink-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            New chat
          </button>
          <button
            type="button"
            onClick={() => go("resume=1")}
            className="flex w-full items-center gap-2 border border-line-3 bg-panel px-3 py-2.5 text-sm text-ink-2"
          >
            <Clock className="size-4" aria-hidden="true" />
            Previous chat
          </button>
        </div>
      )}
    </div>
  );
}

export function AppNavBar() {
  const address = useWalletStore((s) => s.address) ?? demoAddress;
  const agent = useAgent(address);

  return (
    <>
      <div className="sticky top-0 z-30 flex shrink-0 flex-col">
        {/* Frame 1: brand + connection status */}
        <header className="flex h-14 items-center justify-between border-b border-line-2 bg-app-canvas px-4 sm:px-6">
          <Link to="/app" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <img src="/oracle-logo.png" alt="" className="size-6 object-contain" />
            <span className="text-[14px] font-medium tracking-tight text-ink-1 sm:text-[15px]">The Oracle</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="hidden rounded-full border border-success-border bg-success-bg px-3 py-1 font-mono text-[11.5px] text-success sm:inline">
              ● 0G Chain
            </span>

            <div className="hidden items-center gap-2 rounded-md border border-line-4 px-2.5 py-1.5 md:flex">
              <IdentityAvatar seed={address} size={18} />
              <span className="font-mono text-xs text-ink-2">{agent.data?.agent?.name ?? "…"}</span>
              {agent.data?.agent && (
                <span className="font-mono text-xs text-ink-6">{Math.round(agent.data.agent.pairReputation * 100)}%</span>
              )}
            </div>

            <WalletStatusButton className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line-4 px-2.5 py-1.5 font-mono text-[11px] text-ink-5 hover:text-ink-1 sm:px-3 sm:text-xs" />
          </div>
        </header>

        {/* Mobile-only: 0G Chain + agent status, shown inline in Frame 1 at sm+, so they need their own row here instead of disappearing. Still inside the sticky wrapper. */}
        <div className="flex items-center justify-between gap-2 border-b border-line-2 bg-app-canvas px-4 py-2 sm:hidden">
          <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-bg px-2.5 py-0.5 font-mono text-[10.5px] text-success">
            ● 0G Chain
          </span>
          <div className="flex items-center gap-1.5 rounded-md border border-line-4 px-2 py-1">
            <IdentityAvatar seed={address} size={16} />
            <span className="font-mono text-[11px] text-ink-2">{agent.data?.agent?.name ?? "…"}</span>
            {agent.data?.agent && (
              <span className="font-mono text-[11px] text-ink-6">{Math.round(agent.data.agent.pairReputation * 100)}%</span>
            )}
          </div>
        </div>

        {/* Frame 2: primary nav — squared, bordered cards, same treatment as the wallet picker. Desktop only; mobile uses the bottom tab bar below. */}
        <nav className="hidden h-[60px] flex-wrap items-center justify-center gap-2.5 border-b border-line-2 bg-panel-2 px-6 md:flex">
          <SparNavItem />
          {otherNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(navItemClass, isActive ? "border-line-7 bg-panel-3 text-ink-1" : "text-ink-6")}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile bottom tab bar — same 5 destinations as the desktop nav, just reachable by thumb. */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[60px] items-stretch border-t border-line-2 bg-app-canvas pb-[env(safe-area-inset-bottom)] md:hidden">
        <MobileSparTab />
        {bottomTabItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn("flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px]", isActive ? "text-ink-1" : "text-ink-6")
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
