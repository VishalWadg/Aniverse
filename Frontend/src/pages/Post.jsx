import React, { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../Appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import postApi from "../api/postApi";
import { selectToasts } from "../store";
import useToasts from "../hooks/useToasts";

export const postLoader = async ({params}) => {
    try {
        const data = await postApi.getPost(params.id);
        return data;
    } catch (error) {
        return null;
    }
} 

export default function Post() {
    const post = useLoaderData();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.author.username === userData.username : false;
    
    const toast = useToasts();
    

    const deletePost = async() => {
        try {
            await toast.promise(postApi.deletePost(post.id), {
                loading: "Deleting Post...",
                success: "Post Deleted Successfully!",
                error: "Failed to Delete Post"
            });
            navigate("/")
        } catch (error) {
            console.error("Failed to delete Post", error)
        }
    };

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-2xl flex justify-center mb-4 border rounded-xl p-2 m-auto flex-col gap-4 border-transparent">
                    {/* <div className=" w-full flex justify-center">
                        <img
                            src={appwriteService.getFilePreview(post.FeaturedImage)}
                            alt={post.title}
                            className="object-contain rounded-xl  w-xl"
                        />
                    </div> */}

                    {isAuthor && (
                        <div className="">
                            <Link to={`/edit-post/${post.id}`}>
                                <Button bgColor="bg-green-500" className="mr-3 rounded-md">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost} className="rounded-md">
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                <div className="w-full mb-6">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="text-gray-500">By {post.author.username}</p>
                </div>
                <div className="browser-css">
                    {parse(post.content)}
                    </div>
            </Container>
        </div>
    ) : null;
}