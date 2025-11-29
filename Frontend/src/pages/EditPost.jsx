import React, { useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Container, PostForm } from '../components';
import postApi from '../api/postApi';

// --- 1. THE LOADER (Runs before render) ---
export const editPostLoader = async ({ params }) => {
    // The route is "/edit-post/:id", so we access params.id
    try {
        const post = await postApi.getPost(params.id);
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
    const post = useLoaderData(); 
    const navigate = useNavigate();

    console.log('Post object:', post);

    useEffect(() => {
        // If the ID was wrong or post doesn't exist, redirect home
        // (You could also show an error message instead)
        if (!post) {
            navigate('/');
            return null;
        }
    }, [post, navigate])


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