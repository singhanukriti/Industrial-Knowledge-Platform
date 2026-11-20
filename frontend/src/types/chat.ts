export interface ChatMessage {
    id:        string;
    role:      "user" | "assistant";
    content:   string;
    timestamp: string;
}

export interface ChatRequest {
    filename: string;
    question: string;
}

export interface ChatResponse {
    filename: string;
    question: string;
    answer:   string;
}
