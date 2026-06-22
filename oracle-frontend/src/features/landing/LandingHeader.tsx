import { Link } from "react-router-dom";
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

  return (
    <div className="sticky top-0 z-40 bg-canvas/[0.82] backdrop-blur-md">
      <div className="border-b border-line-2">
        <div className="mx-auto flex max-w-[1180px] items-center justify-center gap-2.5 px-6 py-[9px] font-mono text-[12.5px] text-ink-5">
          <span className="inline-block size-1.5 rounded-full bg-success-dim" />
          <span>Built on 0G · Zero Cup 2026.</span>
          <a href="#" className="border-b border-[#3a3470] text-ink-1 no-underline">
            Read the submission →
          </a>
        </div>
      </div>

      <header className="border-b border-line-2">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-11">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/oracle-logo.png" alt="The Oracle" className="size-[30px] object-contain" />
              <span className="text-lg font-medium tracking-tight text-ink-1">The Oracle</span>
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
          <div className="flex items-center gap-4.5">
            <WalletStatusButton />
            <button
              type="button"
              onClick={openModal}
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-[13.5px] font-medium text-primary-foreground"
            >
              Launch app
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
