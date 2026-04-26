import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import postApi from "../api/postApi";
import useToasts from "../hooks/useToasts";
import { sanitizeMonolithHtml } from "../lib/monolith-html";
import { useGetPostQuery } from "@/api/postsApi";
import { useDeletePostMutation } from "@/api/postsApi";

export const postLoader = async ({ params, request }) => {
    try {
        const data = await postApi.getPost(params.id, { signal: request.signal });
        return data;
    } catch (error) {
        return null;
    }
} 

export default function Post() {
    const {id}  = useParams() ;
    const {data, error, isLoading} = useGetPostQuery(id);
    const [deletePostMutation] = useDeletePostMutation();
    const post = data;
    const navigate = useNavigate();
    const userData = useSelector((state: any) => state.auth.userData);

    const isAuthor = post && userData ? post.author?.username === userData.username : false;
    
    const toast = useToasts();
    

    const deletePost = async() => {
        try {
            await toast.promise(deletePostMutation(post.id).unwrap(), {
                loading: "Deleting Post...",
                success: "Post Deleted Successfully!",
                error: "Failed to Delete Post"
            });
            navigate("/")
        } catch (error) {
            console.error("Failed to delete Post", error)
        }
    };

    if(isLoading){
        return <p>Loading...</p>
    }
    if(error){
        let errorMessage = "something went wrong";
        if('status' in error){
            errorMessage = `Error ${error.status} : ${typeof error.data === 'object' ? JSON.stringify(error.data) : error.data}`;
        }else if('message' in error){
            errorMessage = error.message ?? errorMessage;
        }

        return <p>{errorMessage}</p>
    }

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
                        {parse(sanitizeMonolithHtml(post.content ?? ''))}
                    </div>
                </article>
            </Container>
        </div>
    ) : null;
}
