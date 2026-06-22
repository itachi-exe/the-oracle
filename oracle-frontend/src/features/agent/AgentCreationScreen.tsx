import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createAgent } from "@/lib/api";
import { hasContractConfig } from "@/lib/chain/config";
import { createAgentOnChain } from "@/lib/chain/contracts";
import { useWalletStore } from "@/features/wallet/useWalletStore";
import type { Category } from "@/lib/types";

const categories: Category[] = ["sports", "crypto", "culture"];

export function AgentCreationScreen({ address }: { address: string }) {
  const queryClient = useQueryClient();
  const isReal = useWalletStore((s) => s.isReal);
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<Category[]>(["crypto"]);

  const create = useMutation({
    mutationFn: async () => {
      if (isReal && hasContractConfig()) {
        await createAgentOnChain(name.trim());
      }
      return createAgent({ address, name: name.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", address] });
    },
  });

  function toggleInterest(category: Category) {
    setInterests((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-app-canvas px-6">
      <div className="w-full max-w-[420px]">
        <img src="/oracle-logo.png" alt="" className="mx-auto mb-6 size-12 object-contain" />
        <h1 className="mb-2 text-center text-2xl font-medium tracking-tight text-ink-1">Name your agent</h1>
        <p className="mb-8 text-center text-sm leading-relaxed text-ink-5">
          One agent per wallet. It starts at a coin flip, 50% shared reputation, and sharpens as you spar with
          it.
        </p>

        <div className="mb-5">
          <label className="mb-2 block text-[13px] text-ink-5">Agent name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cassowary"
            className="w-full rounded-lg border border-line-5 bg-panel-2 px-3.5 py-[11px] text-sm text-ink-1 placeholder:text-ink-7 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-[13px] text-ink-5">Interests</label>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleInterest(category)}
                className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-[13px] capitalize transition-colors duration-150 ${
                  interests.includes(category)
                    ? "border-line-7 bg-panel-3 text-ink-1"
                    : "border-line-4 text-ink-6 hover:text-ink-2"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!name.trim() || create.isPending}
          onClick={() => create.mutate()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
        >
          {create.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {create.isPending ? "Creating…" : "Create Agent"}
        </button>

        {create.isError && (
          <p className="mt-3 text-center text-xs text-danger">Couldn't create your agent. Try again.</p>
        )}
      </div>
    </div>
  );
}
