import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    color = "text-blue-600",
}: StatCardProps) {
    return (
        <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <h2 className="mt-2 text-3xl font-bold">{value}</h2>
                </div>
                <div className={`rounded-xl bg-slate-100 p-4 ${color}`}>
                    <Icon size={30} />
                </div>
            </CardContent>
        </Card>
    );
}
