import { useCreateCommentMutation, useUpdateCommentMutation } from "@/api/commentsApi";
import { RootState } from "@/store/store";
import {motion} from 'framer-motion'
import { useState } from "react"
import { useSelector } from "react-redux";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import UserAvatar from "../User/UserAvatar";

interface CommentFormProps {
    postId: number,
    existingCommentId?: number,
    initialContent?: string,
    onSuccess?: () => void,
    onCancel? : () => void,
}

export const CommentForm = ({
    postId,
    existingCommentId,
    initialContent = '',
    onSuccess,
    onCancel,
}: CommentFormProps) => {
    const [content, setContent] = useState(initialContent);
    const user = useSelector((state: RootState) => state.auth.userData);
    const [createComment, {isLoading: isCreating}] = useCreateCommentMutation();
    const [updateComment, {isLoading: isUpdating}] = useUpdateCommentMutation();
    const isEditing = !!existingCommentId;
    const isLoading = isCreating || isUpdating;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!content.trim()) return;

        try {
            if(isEditing){
                await updateComment({postId, commentId: existingCommentId, content}).unwrap();
            }else {
                await createComment({postId, content}).unwrap();
                setContent('');
            }
            if(onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to save the comment:", error);
        }
    };

    if(!user){
        return (
            <div className="p-4 border border-border rounded-lg bg-card text-card-foreground text-center">
                <p className="text-muted-foreground mb-4">
                    You must be Logged in to leave a comment.
                </p>
                <Button asChild>
                    <a href="/login">Log In</a>
                </Button>
            </div>
        )
    }

    return(
        <motion.form
            onSubmit={handleSubmit}
            className="flex gap-4 items-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="hidden sm:block mt-1">
                <UserAvatar
                    userName={user.username}
                    profileUrl={user.profilePic}
                    size="default"
                />
            </div>
            <div className="flex-1 flex flex-col gap-3">
                <Textarea
                    placeholder="What are your thoughts ?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isLoading}
                    className="min-h-[100px] resize-y bg-background focus-visible:ring-primary"
                />
                <div className="flex justify-end gap-2">
                    {
                        isEditing && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        )
                    }
                    <motion.div whileHover={{scale: 1.02}} whileTap={{scale:0.98}}>
                        <Button type="submit" disabled={isLoading || !content.trim()}>
                            {isLoading ? 'Saving...' : (isEditing ? 'Save Edit' : 'Post Comment')}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.form>
    )
}