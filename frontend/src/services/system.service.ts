import type { SystemStatus } from "@/types/system";
import api from "./api";

export async function getSystemStatus(): Promise<SystemStatus> {
    const response = await api.get<SystemStatus>("/health");
    return response.data;
}
