import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { LandingPage } from "@/features/landing/LandingPage";
import { DocsPage } from "@/features/docs/DocsPage";
import { SparPage } from "@/features/spar/SparPage";
import { LoggerPage } from "@/features/logger/LoggerPage";
import { LeaderboardPage } from "@/features/leaderboard/LeaderboardPage";
import { PredictionsPage } from "@/features/predictions/PredictionsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { WalletConnectModal } from "@/features/wallet-modal/WalletConnectModal";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<SparPage />} />
          <Route path="logger" element={<LoggerPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <WalletConnectModal />
    </>
  );
}
