import { ShieldCheck } from "lucide-react";

const columns = [
  { heading: "Product", links: ["Spar", "Prediction Logger", "Leaderboard", "Active Markets", "Track Record"] },
  { heading: "Build", links: ["How it works", "0G Stack", "Live Demo", "GitHub", "Submission"] },
  { heading: "Resources", links: ["Documentation", "0G Explorer", "X / Twitter", "Support", "Terms"] },
];

export function Footer() {
  return (
    <footer className="border-t border-line-2">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-4.5 flex items-center gap-2.5">
            <img src="/oracle-logo.png" alt="" className="size-7 object-contain" />
            <span className="text-lg font-medium tracking-tight text-ink-1">The Oracle</span>
          </div>
          <p className="m-0 mb-5.5 max-w-[240px] text-sm leading-[1.5] text-ink-6">
            An agent you own, not one you share.
          </p>
          <div className="flex gap-3.5">
            <div className="text-center">
              <div className="mb-1.5 flex size-[42px] items-center justify-center rounded-full border border-line-5 text-ink-6">
                <ShieldCheck className="size-[17px]" aria-hidden="true" />
              </div>
              <div className="text-[10px] text-ink-7">TEE Verified</div>
            </div>
            <div className="text-center">
              <div className="mb-1.5 flex size-[42px] items-center justify-center rounded-full border border-line-5 font-mono text-[9px] text-ink-6">
                0G
              </div>
              <div className="text-[10px] text-ink-7">On-chain</div>
            </div>
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-7">{col.heading}</div>
            <div className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <a key={link} href="#" className="w-fit text-sm text-ink-4 no-underline hover:text-ink-1">
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line-2">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
          <span className="font-mono text-[12.5px] text-ink-7">© 2026 The Oracle. Built on 0G.</span>
          <div className="flex items-center gap-2">
            <span className="size-[7px] animate-pulse rounded-full bg-success-dim" />
            <span className="font-mono text-[12.5px] text-ink-6">0G Chain · operational</span>
          </div>
        </div>
      </div>
      <div className="select-none overflow-hidden py-10 text-center text-[13vw] font-medium leading-none tracking-[-0.04em] text-[#101018]">
        THE ORACLE
      </div>
    </footer>
  );
}
