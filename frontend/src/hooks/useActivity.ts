import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getActivity } from "@/services/activity.service";

export function useActivity() {
    return useQuery({
        queryKey: ["activity"],
        queryFn: getActivity,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });
}
