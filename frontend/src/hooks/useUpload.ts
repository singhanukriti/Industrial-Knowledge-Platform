import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadPDF } from "@/services/upload.service";

export function useUpload() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadPDF,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["documents"] });
            void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            void queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
            void queryClient.invalidateQueries({ queryKey: ["activity"] });
            void queryClient.invalidateQueries({ queryKey: ["storage"] });
        },
    });
}
