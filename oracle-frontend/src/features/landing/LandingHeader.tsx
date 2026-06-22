import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useWalletStore } from "@/features/wallet/useWalletStore";
import { WalletStatusButton } from "@/features/wallet/WalletStatusButton";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Docs", href: "/docs" },
];

export function LandingHeader() {
  const openModal = useWalletStore((s) => s.openModal);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-canvas/[0.82] backdrop-blur-md">
      <div className="border-b border-line-2">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-1.5 px-4 py-[9px] text-center font-mono text-[11px] text-ink-5 sm:gap-2.5 sm:px-6 sm:text-[12.5px]">
          <span className="inline-block size-1.5 shrink-0 rounded-full bg-success-dim" />
          <span>Built on 0G · Zero Cup 2026.</span>
          <a href="#" className="border-b border-[#3a3470] text-ink-1 no-underline">
            Read the submission →
          </a>
        </div>
      </div>

      <header className="border-b border-line-2">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-11">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
              <img src="/oracle-logo.png" alt="The Oracle" className="size-[26px] object-contain sm:size-[30px]" />
              <span className="text-base font-medium tracking-tight text-ink-1 sm:text-lg">The Oracle</span>
            </Link>
            <nav className="hidden items-center gap-7 text-sm text-ink-4 md:flex">
              {navLinks.map(({ label, href }) =>
                href.startsWith("/") ? (
                  <Link key={label} to={href} className="cursor-pointer text-ink-4 no-underline hover:text-ink-1">
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href} className="cursor-pointer text-ink-4 no-underline hover:text-ink-1">
                    {label}
                  </a>
                ),
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4.5">
            <div className="hidden sm:block">
              <WalletStatusButton />
            </div>
            <button
              type="button"
              onClick={openModal}
              className="cursor-pointer rounded-md bg-primary px-3 py-2 text-[12.5px] font-medium text-primary-foreground sm:px-4 sm:text-[13.5px]"
            >
              Launch app
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-line-4 text-ink-3 md:hidden"
            >
              {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-line-2 bg-panel-2 px-4 py-3 md:hidden">
            {navLinks.map(({ label, href }) =>
              href.startsWith("/") ? (
                <Link
                  key={label}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md border border-line-3 bg-panel px-3.5 py-2.5 text-sm text-ink-2 no-underline"
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md border border-line-3 bg-panel px-3.5 py-2.5 text-sm text-ink-2 no-underline"
                >
                  {label}
                </a>
              ),
            )}
            <div className="mt-1 border-t border-line-2 pt-3">
              <WalletStatusButton className="flex w-full cursor-pointer items-center gap-1.5 rounded-md border border-line-3 bg-panel px-3.5 py-2.5 text-sm text-ink-2" />
            </div>
          </nav>
        )}
      </header>
    </div>
  );
}
