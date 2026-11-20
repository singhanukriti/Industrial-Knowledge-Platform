export interface SystemService {
    name: string;
    status: "connected" | "disconnected" | "ready" | "error";
}

export interface SystemStatus {
    services: SystemService[];
}
