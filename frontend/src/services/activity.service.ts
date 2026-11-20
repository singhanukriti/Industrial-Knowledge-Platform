import type { Activity } from "@/types/activity";
import api from "./api";

export async function getActivity(): Promise<Activity[]> {
    const response = await api.get<Activity[]>("/dashboard/activity");
    return response.data;
}
