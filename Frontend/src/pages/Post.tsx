import React from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import postApi from "../api/postApi";
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
    const post = useLoaderData() as any;
    const navigate = useNavigate();
    const userData = useSelector((state: any) => state.auth.userData);

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
        <div className="py-8 sm:py-12">
            <Container>
                <article className="mx-auto w-full max-w-[880px]">
                    {isAuthor && (
                        <div className="mb-6 flex flex-wrap justify-end gap-3">
                            <Link to={`/edit-post/${post.id}`}>
                                <Button
                                    bgColor="bg-white hover:bg-zinc-200 dark:bg-zinc-100 dark:hover:bg-white"
                                    textColor="text-zinc-950"
                                    className="rounded-md border border-white/10"
                                >
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                bgColor="bg-red-500/90 hover:bg-red-500"
                                textColor="text-white"
                                onClick={deletePost}
                                className="rounded-md"
                            >
                                Delete
                            </Button>
                        </div>
                    )}

                    <header className="mb-6 sm:mb-8">
                        <h1 className="monolith-preview__title">{post.title}</h1>
                        <p className="monolith-preview__meta">By {post.author.username}</p>
                    </header>

                    <div id="mono-preview" className="monolith-rendered">
                        {parse(post.content ?? '')}
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}
