import type { Document } from "@/types/document";
import api from "./api";

export async function getDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>("/documents");
    return response.data;
}
