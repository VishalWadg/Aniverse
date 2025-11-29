import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Input, Button, RTE } from '../index' // Select removed if not used
import postApi from '../../api/postApi'
import useToasts from '../../hooks/useToasts'

function PostForm({ post }) {

    const toasts = useToasts();

    const { register, handleSubmit, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || '',
            // Removed slug
            content: post?.content || '',
        }
    })

    const navigate = useNavigate()
    // We don't need userData for creating/updating logic anymore, 
    // backend handles author assignment via Token.

    const submit = async (data) => {
        try {
            if (post) {
                // --- UPDATE ---
                const updateData = {
                    title: data.title,
                    content: data.content
                };
                // Use post.id here
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
                // --- CREATE ---
                // console.log(userData);
                const createData = {
                    title: data.title,
                    content: data.content,
                    // categoryId: 1 // Hardcoded for now until you add Category Select
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
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                
                {/* SLUG INPUT REMOVED */}
                
                <RTE 
                    label="Content :" 
                    name="content" 
                    control={control} 
                    defaultValue={getValues("content")} 
                />
            </div>
            
            <div className="w-1/3 px-2">
                {/* Image Input Removed */}

                <Button type="submit" className={`w-full ${post ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}>
                    {post ? "Update Post" : "Submit Post"}
                </Button>
            </div>
        </form>
    )
}

export default PostForm