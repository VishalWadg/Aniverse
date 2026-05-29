import { useGetPostsByUsernameQuery } from "@/api/postsApi"
import PostCard from "@/components/PostCard"
import { useEffect, useRef, useState } from "react"
import { getApiErrorMessage } from "@/lib/errorUtils"

const USER_POSTS_PAGE_SIZE = 10

const UserPosts = ({
    username,
    canInteract = true,
}: {
    username: string
    canInteract?: boolean
}) => {
    const [prevUsername, setPrevUsername] = useState(username);
    const [page, setPage] = useState(0);

    if (username !== prevUsername) {
        setPrevUsername(username);
        setPage(0);
    }

    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const currentPage = username !== prevUsername ? 0 : page;
    const { data, isLoading, isFetching, error } = useGetPostsByUsernameQuery({ username, page: currentPage, size: USER_POSTS_PAGE_SIZE });
    const posts = data?.content || [];
    const hasNextPage = Boolean(data && !data.last);
    const errorMessage = error ? getApiErrorMessage(error) : '';

    useEffect(() => {
        const loadMoreNode = loadMoreRef.current;

        if (!loadMoreNode || !hasNextPage || isLoading || isFetching) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPage((prev) => prev + 1);
                }
            },
            { rootMargin: '600px 0px' }
        );

        observer.observe(loadMoreNode);

        return () => observer.disconnect();
    }, [hasNextPage, isFetching, isLoading, posts.length]);

    return (
        <section className="border border-outline-variant bg-surface-container p-card rounded-card shadow-elevation-1 mt-6">
            <div className="border-b border-outline-variant/60 pb-card mb-card">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant/70">
                    Writing archive
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-on-surface">
                    Theories by @{username}
                </h2>
            </div>

            {isLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="space-y-4 border border-outline-variant bg-surface-container-low/40 p-card rounded-card">
                            <div className="flex items-center gap-3">
                                <div className="size-10 animate-pulse rounded-full bg-on-surface/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 animate-pulse bg-on-surface/8" />
                                    <div className="h-2 w-32 animate-pulse bg-on-surface/6" />
                                </div>
                            </div>
                            <div className="h-7 w-3/4 animate-pulse bg-on-surface/10" />
                            <div className="h-36 animate-pulse bg-on-surface/6" />
                        </div>
                    ))}
                </div>
            ) : errorMessage ? (
                <div className="py-10 text-sm text-error">{errorMessage}</div>
            ) : posts.length ? (
                <div>
                    <div className="grid items-stretch gap-card sm:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post) => (
                            <div key={post.id} className="min-w-0">
                                <PostCard {...post} canInteract={canInteract} variant="compact" />
                            </div>
                        ))}
                    </div>

                    {hasNextPage ? (
                        <div ref={loadMoreRef} className="mt-card flex justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isFetching) {
                                        setPage((prev) => prev + 1);
                                    }
                                }}
                                disabled={isFetching}
                                className="h-control-h rounded-control border border-outline-variant px-control-x py-control-y text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:border-outline hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isFetching ? 'Loading...' : 'Load more'}
                            </button>
                        </div>
                    ) : (
                        <p className="mt-card text-center text-sm text-on-surface-variant/70">
                            End of @{username}'s archive.
                        </p>
                    )}
                </div>
            ) : (
                <div className="py-10">
                    <p className="text-base text-on-surface-variant">No posts published yet.</p>
                    <p className="mt-2 text-sm text-on-surface-variant/60">
                        When @{username} publishes a theory, it will appear here.
                    </p>
                </div>
            )}
        </section>
    )
}

export default UserPosts
