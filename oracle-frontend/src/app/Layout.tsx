import { Outlet } from "react-router-dom";
import { AppNavBar } from "@/features/app-shell/AppNavBar";
import { NetworkGuard } from "@/features/wallet/NetworkGuard";
import { AgentCreationScreen } from "@/features/agent/AgentCreationScreen";
import { useAgent } from "@/features/agent/useAgent";
import { useWalletStore } from "@/features/wallet/useWalletStore";
import { demoAddress } from "@/lib/mockData";

export function Layout() {
  const address = useWalletStore((s) => s.address) ?? demoAddress;
  const agent = useAgent(address);

  if (agent.isLoading) {
    return <div className="flex h-screen items-center justify-center bg-app-canvas text-sm text-ink-6">Loading…</div>;
  }

  if (agent.data && !agent.data.exists) {
    return <AgentCreationScreen address={address} />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-canvas font-sans text-ink-1 antialiased">
      <AppNavBar />
      <NetworkGuard />
      <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
