import { useGetCommentsQuery } from "@/api/commentsApi";
import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { Virtuoso } from "react-virtuoso";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps{
    postId: string;
}

export const CommentSection = ({postId}: CommentSectionProps) => {
    const [page, setPage] = useState(0);
    const {data, isLoading, isError, isFetching} = useGetCommentsQuery({postId, page});
    
    const loadMore = () => {
        if(data && !data.last && !isFetching){
            setPage((prev) => prev+1);
        }
    }

    return (
        <section className="mt-12 pt-8 border-t border-border">
            <h3 className="text-2xl font-bold mb-6 text-foreground">
                Comments {data?.totalElements !== undefined ? `(${data.totalElements})` : ''}
            </h3>
            <div className="mb-10">
                <CommentForm
                    postId={postId}
                />
            </div>
            {isError ? (
                <div className="text-center py-8 text-destructive">
                    Failed to load comments.
                </div>
            ): isLoading && page === 0 ? (
                <div className="text-center py-8 text-muted-foreground animate-pulse">Loading comments...</div>
            ): data?.content.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                    No comments yet. Be the first to share your thoughts!
                </div>
            ):(
                <Virtuoso
                    useWindowScroll
                    data={data?.content || []}
                    endReached={loadMore}
                    itemContent={(index, comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId  }
                        />
                    )}
                    components={{
                        Footer: () => {
                            if(isFetching && page > 0){
                                return <div className="py-4 text-center text-sm text-muted-foreground animate-pulse">
                                    Loading more...</div>;
                            }
                            if(data?.last){
                                return <div className="py-8 text-center text-sm text-muted-foreground opacity-50">
                                    End of discussion</div>;
                            }
                            return null;
                        }
                    }}
                />
            )
            }
        </section>
    )
}