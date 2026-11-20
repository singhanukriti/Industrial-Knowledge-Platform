import { CheckCircle2, Upload, Trash2, Image, Table, Clock3 } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";

const TYPE_ICON: Record<string, React.ElementType> = {
    indexed:  CheckCircle2,
    uploaded: Upload,
    deleted:  Trash2,
    images:   Image,
    tables:   Table,
};

const TYPE_COLOR: Record<string, string> = {
    indexed:  "text-green-600",
    uploaded: "text-blue-600",
    deleted:  "text-red-500",
    images:   "text-orange-500",
    tables:   "text-purple-600",
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);

    if (mins  < 1)   return "just now";
    if (mins  < 60)  return `${mins} min ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  === 1) return "yesterday";
    return `${days} days ago`;
}

export default function RecentActivity() {
    const { data = [] } = useActivity();

    return (
        <div className="rounded-xl border p-6">
            <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>

            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No activity yet.
                </p>
            ) : (
                <div className="space-y-4">
                    {data.map((item, index) => {
                        const Icon  = TYPE_ICON[item.type]  ?? Clock3;
                        const color = TYPE_COLOR[item.type] ?? "text-muted-foreground";
                        const date  = new Date(item.timestamp);

                        return (
                            <div key={index} className="flex gap-3">
                                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-snug">
                                        {item.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {date.toLocaleDateString(undefined, {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                        {" • "}
                                        {timeAgo(item.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
