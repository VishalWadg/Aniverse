import React from 'react';
import { Navigate, useLoaderData, useLocation } from 'react-router-dom';
import { Container, PostForm } from '../components';
import postApi from '../api/postApi';
import { useSelector } from 'react-redux';

// --- 1. THE LOADER (Runs before render) ---
export const editPostLoader = async ({ params, request }) => {
    // The route is "/edit-post/:id", so we access params.id
    try {
        const post = await postApi.getPost(params.id, { signal: request.signal });
        return post;
    } catch (error) {
        // If post not found or error, return null so we can handle it in component
        // (Or let it bubble to the ErrorElement)
        return null;
    }
};

function EditPost() {
    // --- 2. GET DATA ---
    // The data is already here when the component mounts!
    const post = useLoaderData() as any;
    const location = useLocation();
    const userData = useSelector((state: any) => state.auth.userData);
    const isAuthor = Boolean(post && userData && post.author.username === userData.username);

    if (!post) {
        return <Navigate to="/" replace />;
    }

    if (!userData) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthor) {
        return (
            <Navigate
                to={`/post/${post.id}`}
                replace
                state={{
                    toast: {
                        id: `edit-post-access:${location.key}`,
                        type: 'error',
                        message: "You can't edit this post",
                        duration: 4000,
                    },
                }}
            />
        );
    }

    return (
        <div className='py-8'>
            <Container>
                {/* Pass the fetched post to the form */}
                <PostForm post={post} />
            </Container>
        </div>
    );
}

export default EditPost;
