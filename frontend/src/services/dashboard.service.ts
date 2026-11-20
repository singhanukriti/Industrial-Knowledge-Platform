import type { DashboardStats } from "@/types/dashboard";
import type { RecentDocument } from "@/types/document";
import type { StorageUsage } from "@/types/storage";
import api from "./api";

export async function getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
}

export async function getRecentDocuments(): Promise<RecentDocument[]> {
    const response = await api.get<RecentDocument[]>("/dashboard/recent");
    return response.data;
}

export async function getStorageUsage(): Promise<StorageUsage> {
    const response = await api.get<StorageUsage>("/dashboard/storage");
    return response.data;
}
