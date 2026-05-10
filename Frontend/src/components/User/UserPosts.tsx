import { useGetPostsByUsernameQuery, type Post } from "@/api/postsApi"
import PostCard from "@/components/PostCard"
import { useState } from "react"
import {VirtuosoGrid} from "react-virtuoso"
import { getApiErrorMessage } from "@/lib/errorUtils"

const UserPosts = ({
    username,
    canInteract = true,
}: {
    
    username: string
    canInteract?: boolean
}) => {

    const [page, setPage] = useState(0);
    const { data, isLoading, isFetching, error } = useGetPostsByUsernameQuery({ username, page });
    const posts = data?.content || [];
    const hasNextPage = !data?.last;
    const errorMessage = error ? getApiErrorMessage(error) : '';
    return (
        <section className="border border-white/10 bg-[#101010]">
            <div className="border-b border-white/8 px-5 py-5 sm:px-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#787878]">
                    Writing archive
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                    Theories by @{username}
                </h2>
            </div>

            {isLoading ? (
                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="space-y-4 border border-white/8 bg-black/25 p-5">
                            <div className="flex items-center gap-3">
                                <div className="size-10 animate-pulse rounded-full bg-white/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 animate-pulse bg-white/8" />
                                    <div className="h-2 w-32 animate-pulse bg-white/6" />
                                </div>
                            </div>
                            <div className="h-7 w-3/4 animate-pulse bg-white/10" />
                            <div className="h-36 animate-pulse bg-white/6" />
                        </div>
                    ))}
                </div>
            ) : errorMessage ? (
                <div className="px-5 py-10 text-sm text-[#ff9d96] sm:px-7">{errorMessage}</div>
            ) : posts.length ? (
                <div className="overflow-hidden">
                    <VirtuosoGrid
                        useWindowScroll
                        data={posts}
                        listClassName="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3"
                        itemClassName="min-w-0"
                        endReached={() => {
                            // When the user scrolls to the bottom, fetch the next page!
                            if (!isFetching && hasNextPage) {
                                setPage((prev) => prev + 1)
                            }
                        }}
                        itemContent={(index, post) => (
                            // Render your PostCard inside here exactly as you did in the map!
                            <div className={'border-t border-white/8 p-5 sm:p-7'}>
                                <PostCard {...post} />
                            </div>
                        )}
                    />

                </div>
            ) : (
                <div className="px-5 py-10 sm:px-7">
                    <p className="text-base text-[#d0d0d0]">No posts published yet.</p>
                    <p className="mt-2 text-sm text-[#787878]">
                        When @{username} publishes a theory, it will appear here.
                    </p>
                </div>
            )}
        </section>
    )
}

export default UserPosts
