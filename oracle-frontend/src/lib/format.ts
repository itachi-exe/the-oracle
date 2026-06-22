export function formatTimeRemaining(closesAt: number) {
  const ms = closesAt - Date.now();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days}d left`;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours}h left`;
}
