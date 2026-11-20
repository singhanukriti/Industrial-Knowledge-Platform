import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getRecentDocuments } from "@/services/dashboard.service";

export function useRecentDocuments() {
    return useQuery({
        queryKey: ["recent-documents"],
        queryFn: getRecentDocuments,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
}
