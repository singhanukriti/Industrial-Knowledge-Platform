import type { UploadResponse } from "@/types/upload";
import api from "./api";

export async function uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("files", file);   // backend expects "files" (plural)

    const response = await api.post<UploadResponse>(
        "/upload",                    // no trailing slash
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
}
