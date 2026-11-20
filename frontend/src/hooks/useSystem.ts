import { useQuery } from "@tanstack/react-query";
import { getSystemStatus } from "@/services/system.service";

export function useSystem() {
    return useQuery({
        queryKey: ["system-status"],
        queryFn: getSystemStatus,
        refetchInterval: 30_000,
    });
}
