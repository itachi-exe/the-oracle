import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO(confirm): wire to real chain-id check once VITE_OG_CHAIN_ID is set (docs.0g.ai).
// Stubbed to never trigger until then — UI only.
const WRONG_NETWORK = false;

export function NetworkGuard() {
  if (!WRONG_NETWORK) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2 text-sm text-foreground">
      <span className="flex items-center gap-2">
        <TriangleAlert className="size-4" aria-hidden="true" />
        Wrong network. Switch to 0G Chain to lock predictions.
      </span>
      <Button size="sm" variant="outline">
        Switch Network
      </Button>
    </div>
  );
}
