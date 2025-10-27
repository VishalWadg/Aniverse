import React, { use, useCallback, useEffect} from 'react'
import { useForm } from 'react-hook-form'
import {Input, Button, Select, RTE} from '../index'
import appwriteService from '../../Appwrite/config'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
function PostForm({post}) {
    const {register, handleSubmit, watch, setValue, control, getValues} = useForm({  // control is used for custom components it is passed to Controller component 
        defaultValues:{  // defaultValues is used to set the initial values of the form fields
            Title: post?.Title || '',
            slug: post?.slug || '',
            Status: post?.Status || 'draft',
            Content: post?.Content || ''
        }
    })
    const navigate = useNavigate()
    const userData = useSelector(state => state.auth.userData)
    const submit = async(data) => {
        // console.log("Form Data: ", data.Content)
        try {
            console.log(post)
            if(post){
                const file = data.FeaturedImage[0]? await appwriteService.uploadFile(data.FeaturedImage[0]) : null
                // console.log(data)
                if(file){
                    appwriteService.deleteFile(post.FeaturedImage) // delete the previous image from appwrite storage
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    FeaturedImage: file ? file.$id : post.FeaturedImage
                })
                if(dbPost){
                    navigate(`/post/${dbPost.$id}`)
                }
            }else{
                const file = await appwriteService.uploadFile(data.FeaturedImage[0]) // upload the image to appwrite storage
                if(file){
                    const dbPost = await appwriteService.createPost({
                        ...data,
                        FeaturedImage: file ? file.$id : null,
                        UserId: userData.$id
                    })
                    
                    if(dbPost){
                        navigate(`/post/${dbPost.$id}`)
                    }
                }
            }
        } catch (error) {
            console.log("error in submision : ", error)
        }
    }

    const slugTransform = useCallback((value) => {
        if(value && typeof value === 'string'){
            return value
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z\d\s]+/g, "-") // replace special characters with hyphen
            .replace(/\s/g, "-") // replace spaces with hyphen
        }
        return ''
    },[])

    useEffect(() => {     // to watch the title field and update the slug field accordingly
        const subscription = watch((value, {name}) => {
            if (name === 'Title'){
                setValue('slug', slugTransform(value.Title), {shouldValidate: true})
            }
        })

        return () => subscription.unsubscribe()
    },[watch, slugTransform, setValue])

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">  {/* handleSubmit is a function that will validate the form and then call the submit function */}
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("Title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    value={post? post.$id : ""}
                    className="mb-4"
                    {...register("slug", { required: true })}  
                    onInput={(e) => {  // to update the slug field when user manually changes the slug field
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="Content" control={control} defaultValue={getValues("Content")} /> {/* control is passed to RTE component for react-hook-form integration */}
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("FeaturedImage", { required: !post })}  // image is required only when creating a new post not when updating a post
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.FeaturedImage)}
                            alt={post.Title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("Status", { required: true })} // select input for status field
                />
                <Button type="submit" className="w-full"> {/* change button color to green if updating a post */}
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    )
}

export default PostForm