import type { ChatRequest, ChatResponse } from "@/types/chat";
import api from "./api";

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>("/chat/", request);
    return response.data;
}
