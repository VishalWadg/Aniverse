import { usePurgePostMutation, useRestorePostMutation } from "@/api/adminApi"
import { Post } from "@/api/postsApi"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function AdminDataTable({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) {
        return <div className="p-4 text-center text-slate-500 border rounded-md">No posts found in the trash.</div>
    }
    const [restorePost, { isLoading: isRestoring }] = useRestorePostMutation()
    const [purgePost, { isLoading: isPurging }] = usePurgePostMutation()

    const handleRestore = (id: number) => {
        restorePost(id)
    }

    const handlePurge = (id: number) => {
        purgePost(id)
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post.id}>
                            <TableCell className="font-medium">#{post.id}</TableCell>
                            <TableCell>{post.title}</TableCell>
                            <TableCell>{post.author.username}</TableCell>
                            <TableCell className="text-right space-x-2">
                                {/* We will wire these up to mutations soon! */}
                                <Button disabled={isRestoring || isPurging} onClick={() => handleRestore(post.id)} variant="outline" size="sm">Restore</Button>
                                <Button disabled={isRestoring || isPurging} onClick={() => handlePurge(post.id)} variant="destructive" size="sm">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
