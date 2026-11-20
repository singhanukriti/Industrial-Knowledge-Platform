import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getStorageUsage } from "@/services/dashboard.service";

export function useStorage() {
    return useQuery({
        queryKey: ["storage"],
        queryFn: getStorageUsage,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
}
