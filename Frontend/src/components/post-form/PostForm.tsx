import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, RTE } from '../index'
import postApi from '../../api/postApi'
import useToasts from '../../hooks/useToasts'

type PostFormValues = {
    title: string;
    content: string;
};

type PostFormProps = {
    post?: any;
};

function PostForm({ post }: PostFormProps) {

    const toasts = useToasts();

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
                    postApi.updatePost(post.id, updateData),
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
                    postApi.createPost(createData),
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
        <form onSubmit={handleSubmit(submit)} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
            <div className="min-w-0 text-start">
                <RTE 
                    titleName="title"
                    name="content" 
                    control={control} 
                    titleDefaultValue={post?.title || ''}
                    defaultValue={post?.content || ''} 
                />
            </div>
            
            <div className="lg:sticky lg:top-24">
                <Button
                    type="submit"
                    bgColor="bg-white hover:bg-zinc-200 dark:bg-zinc-100 dark:hover:bg-white"
                    textColor="text-zinc-950"
                    className="w-full rounded-xl border border-white/10 py-3 font-medium transition-colors"
                >
                    {post ? "Update Post" : "Submit Post"}
                </Button>
            </div>
        </form>
    )
}

export default PostForm
