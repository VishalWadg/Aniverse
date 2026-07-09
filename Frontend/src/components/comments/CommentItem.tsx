import { useState } from "react";
import { CommentForm } from "./CommentForm";
import {Comment, useDeleteCommentMutation} from "@/api/commentsApi";
import {motion} from "framer-motion"
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserAvatar from "../User/UserAvatar";
import { formatRelativeTime } from "@/lib/post-helpers";
import { Button } from "../ui/button";

interface commentItemProps {
    comment: Comment;
    postId: string;
}

export const CommentItem = ({comment, postId} : commentItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = useSelector((state : RootState) => state.auth.userData)
    const [deleteComment, {isLoading: isDeleting}] = useDeleteCommentMutation();
    const isOwner = currentUser?.username === comment.author.username;
    const handleDelete = async () => {
        if(window.confirm("Are you sure you want to delete this comment?")){
            try {
                await deleteComment({postId, commentId: comment.id}).unwrap();
            } catch (error) {
                console.error("Failed to delete comment:", error);
            }
        }
    }
    if(isEditing){
        return (
            <div className="py-4">
                <CommentForm
                    postId={postId}
                    existingCommentId={comment.id}
                    initialContent={comment.content}
                    onSuccess={() => setIsEditing(false)}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 border-b border-border/50 group"
        >
            <div className="flex gap-4">
                <div className="mt-1 shrink-0">
                    <UserAvatar
                        userName={comment.author.username}
                        profileUrl={comment.author.profilePic}
                        size="sm"
                        className="size-8"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">
                                u/{comment.author.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                .{formatRelativeTime(comment.createdAt)}
                            </span>
                        </div>
                        {
                            isOwner && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mt-1 break-words">
                        {comment.content}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}