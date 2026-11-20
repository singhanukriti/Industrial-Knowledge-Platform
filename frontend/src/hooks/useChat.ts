import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "@/services/chat.service";

export function useChat() {
    return useMutation({
        mutationFn: sendChatMessage,
    });
}
