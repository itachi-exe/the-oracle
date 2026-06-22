import { LandingHeader } from "./LandingHeader";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { LeaderboardPreview } from "./LeaderboardPreview";
import { LockResolveCards } from "./LockResolveCards";
import { FeatureGrid } from "./FeatureGrid";
import { NoCasino } from "./NoCasino";
import { VerifiedSection } from "./VerifiedSection";
import { MarketsMarquee } from "./MarketsMarquee";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink-1 antialiased">
      <LandingHeader />
      <main>
        <Hero />
        <HowItWorks />
        <LeaderboardPreview />
        <LockResolveCards />
        <FeatureGrid />
        <NoCasino />
        <VerifiedSection />
        <MarketsMarquee />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
