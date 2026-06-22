import { ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TeeBadge({ verified, className }: { verified: boolean; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(!verified && "text-muted-foreground", className)}
      title={verified ? "Response signed inside a 0G TEE enclave" : "TEE signature unverified"}
    >
      {verified ? (
        <ShieldCheck className="size-3.5" aria-hidden="true" />
      ) : (
        <ShieldQuestion className="size-3.5" aria-hidden="true" />
      )}
      {verified ? "TEE Verified" : "Unverified"}
    </Badge>
  );
}

export function EnclavePulse({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
        <span className="relative inline-flex size-2.5 rounded-full bg-foreground" />
      </span>
      Verifying inside enclave…
    </span>
  );
}
