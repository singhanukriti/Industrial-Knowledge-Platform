import { Database, FileText, Image, Table, BookOpen } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StorageUsage from "@/components/dashboard/StorageUsage";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
    const { data } = useDashboard();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Welcome Back 👋</h1>
                <p className="text-muted-foreground mt-2">
                    Industrial Knowledge Platform
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                <StatCard title="Documents" value={data?.documents ?? 0} icon={FileText} color="text-blue-600"   />
                <StatCard title="Pages"     value={data?.pages     ?? 0} icon={BookOpen} color="text-purple-600" />
                <StatCard title="Chunks"    value={data?.chunks    ?? 0} icon={Database} color="text-green-600"  />
                <StatCard title="Images"    value={data?.images    ?? 0} icon={Image}    color="text-orange-600" />
                <StatCard title="Tables"    value={data?.tables    ?? 0} icon={Table}    color="text-pink-600"   />
            </div>

            <QuickActions />

            <div className="grid gap-6 lg:grid-cols-2">
                <RecentDocuments />
                <RecentActivity />
            </div>

            <StorageUsage />
        </div>
    );
}
