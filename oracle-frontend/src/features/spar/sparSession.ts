import type { SparMode, SparringTurn } from "@/lib/types";

export interface SparSession {
  question: string;
  mode: SparMode;
  marketId: string | null;
  turns: SparringTurn[];
  challengeIndex: number;
  latestAgent: { outcome: string; confidence: number } | null;
  latestUser: { outcome: string; confidence: number } | null;
  concluded: boolean;
  final: { outcome: string; confidence: number } | null;
  savedAt: number;
}

function key(address: string) {
  return `oracle_spar_session:${address.toLowerCase()}`;
}

export function saveSparSession(address: string, session: Omit<SparSession, "savedAt">) {
  try {
    localStorage.setItem(key(address), JSON.stringify({ ...session, savedAt: Date.now() }));
  } catch {
    // storage unavailable — session just won't resume, not fatal
  }
}

export function loadSparSession(address: string): SparSession | null {
  try {
    const raw = localStorage.getItem(key(address));
    return raw ? (JSON.parse(raw) as SparSession) : null;
  } catch {
    return null;
  }
}

export function clearSparSession(address: string) {
  try {
    localStorage.removeItem(key(address));
  } catch {
    // ignore
  }
}
