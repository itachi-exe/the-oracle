import {
  Sparkles,
  Moon,
  Star,
  Eye,
  Heart,
  Compass,
  Triangle,
  Sun,
  Waves,
  Diamond,
  Hexagon,
  Zap,
  Orbit,
  Flower2,
} from "lucide-react";

const PALETTE: { bg: string; Icon: typeof Sparkles }[] = [
  { bg: "#3b4a8c", Icon: Orbit },
  { bg: "#6f4fb0", Icon: Moon },
  { bg: "#b8862f", Icon: Star },
  { bg: "#1f7a64", Icon: Eye },
  { bg: "#a13b5e", Icon: Heart },
  { bg: "#2f6f9c", Icon: Compass },
  { bg: "#5f6470", Icon: Hexagon },
  { bg: "#5a8c3b", Icon: Triangle },
  { bg: "#3b3b72", Icon: Sparkles },
  { bg: "#c06a2f", Icon: Sun },
  { bg: "#2f8c8c", Icon: Waves },
  { bg: "#9c3b8c", Icon: Diamond },
  { bg: "#46586b", Icon: Zap },
  { bg: "#b39b2f", Icon: Flower2 },
];

function seedToIndex(seed: string | number) {
  if (typeof seed === "number") return Math.abs(seed) % PALETTE.length;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % PALETTE.length;
}

export function IdentityAvatar({
  seed,
  size = 24,
  src,
}: {
  seed: string | number;
  size?: number;
  src?: string | null;
}) {
  if (src) {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-full bg-panel-3"
        style={{ width: size, height: size }}
      >
        <img src={src} alt="" className="size-full object-cover" />
      </span>
    );
  }

  const { bg, Icon } = PALETTE[seedToIndex(seed)];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: bg }}
    >
      <Icon className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.7} />
    </span>
  );
}
