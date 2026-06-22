import { useQuery } from "@tanstack/react-query";
import { fetchAgent } from "@/lib/api";

export function useAgent(address: string) {
  return useQuery({
    queryKey: ["agent", address],
    queryFn: () => fetchAgent(address),
    enabled: Boolean(address),
  });
}
