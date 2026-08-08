import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, RTE } from '../index'
import useToasts from '../../hooks/useToasts'
import { useCreatePostMutation, useUpdatePostMutation } from '@/api/postsApi'

type PostFormValues = {
    title: string;
    content: string;
};

type PostFormProps = {
    post?: any;
};

function PostForm({ post }: PostFormProps) {

    const toasts = useToasts();
    const [createPost] = useCreatePostMutation();
    const [updatePost] = useUpdatePostMutation();

    const { handleSubmit, control } = useForm<PostFormValues>({
        defaultValues: {
            title: post?.title || '',
            content: post?.content || '',
        }
    })

    const navigate = useNavigate()

    const submit = async (data) => {
        try {
            if (post) {
                const updateData = {
                    title: data.title,
                    content: data.content
                };
                const dbPost = await toasts.promise(
                    updatePost({
                        id: post.id,
                        updates: updateData,
                    }).unwrap(),
                    {
                        loading: "Updating Post...",
                        success: "Post Updated Successfully!",
                        error: "Failed to Update Post"
                    }
                );
                if (dbPost) navigate(`/post/${dbPost.id}`); // Navigate using ID

            } else {
                const createData = {
                    title: data.title,
                    content: data.content,
                };
                const dbPost = await toasts.promise(
                    createPost(createData).unwrap(),
                    {
                        loading: "Creating Post...",
                        success: "Post Created Successfully!",
                        error: "Failed to Create Post"
                    }
                );
                if (dbPost) navigate(`/post/${dbPost.id}`); // Navigate using ID
            }
        } catch (error) {
            console.error("Error submitting post:", error);
        }
    }

    return (
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-full min-h-screen bg-[var(--editor-bg)] text-[var(--editor-text)] transition-colors duration-200">
            {/* Full Width Editor Container with Integrated Submit Toolbar */}
            <div className="w-full min-w-0 text-start">
                <RTE 
                    titleName="title"
                    name="content" 
                    control={control} 
                    titleDefaultValue={post?.title || ''}
                    defaultValue={post?.content || ''} 
                    onSubmit={handleSubmit(submit)}
                    submitLabel={post ? "Update Post" : "Publish Post"}
                    isEditing={Boolean(post)}
                />
            </div>
        </form>
    )
}

export default PostForm
