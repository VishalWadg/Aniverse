import { useCleanupDeletedPostsMutation, useGetDeletedPostsQuery } from "@/api/adminApi"
import { Button } from "@/components/ui/button"
import AdminDataTable from "@/components/admin/AdminDataTable"

export default function AdminDashboard() {
    const { data: posts, isLoading, isError } = useGetDeletedPostsQuery();
    const [cleanupDeletedPosts, { isLoading: isCleaning }] = useCleanupDeletedPostsMutation();

    if (isLoading) return <div className="p-8">Loading Trash Bin...</div>
    if (isError) return <div className="p-8 text-red-500">Failed to load deleted posts.</div>

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6 mt-16">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trash Bin</h1>
                    <p className="text-muted-foreground mt-2">Manage soft-deleted posts.</p>
                </div>
                {/* Empty Trash Button */}
                <Button disabled={isCleaning || isLoading || posts?.content.length === 0} onClick={() => cleanupDeletedPosts()} variant="destructive">Empty Trash</Button>
            </div>

            {/* Reusable Table Component */}
            <AdminDataTable posts={posts?.content || []} />
        </div>
    )
}
