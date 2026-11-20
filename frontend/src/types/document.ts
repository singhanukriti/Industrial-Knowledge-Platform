export interface Document {
    document_id: string;
    filename: string;
    pages: number;
    chunks: number;
    tables: number;
    images: number;
    figures: number;
    graphs: number;
    status: string;
    uploaded_at: string;
}

export interface RecentDocument {
    document_id: string;
    filename: string;
    pages: number;
    chunks: number;
    tables: number;
    images: number;
    figures: number;
    graphs: number;
    status: string;
    uploaded_at: string;
}
