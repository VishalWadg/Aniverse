import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { Container, PostForm } from '../components';
import { useSelector } from 'react-redux';
import { useGetPostQuery } from '@/api/postsApi';
import useToasts from '@/hooks/useToasts';

function EditPost() {
    const { id } = useParams();
    const { data: post, error, isLoading } = useGetPostQuery(id);
    const location = useLocation();
    const userData = useSelector((state: any) => state.auth.userData);
    const { error: errorToast } = useToasts();

    const isAuthor = Boolean(post && userData && post.author?.username === userData.username);

    
    useEffect(() => {
        if (error) {
            if ('status' in error) {
                
                errorToast(error.data as string, 1000);
            } else if ('message' in error) {
                
                errorToast(error.message, 1000);
            }
        }
    }, [error, errorToast]);

    // --- 2. HANDLE LOADING STATE ---
    // Prevent the component from rendering redirects while still fetching
    if (isLoading) {
        return <div className="py-8 text-center">Loading post...</div>; // Or use your Spinner component
    }

    // --- 3. HANDLE REDIRECTS ---
    
    // If not logged in, send to login
    if (!userData) {
        return <Navigate to="/login" replace />;
    }

    // If there is no post (and it's done loading), or an error occurred, go home
    if (!post || error) {
        return <Navigate to="/" replace />;
    }

    // If they are logged in but didn't write this post
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

    // --- 4. SUCCESSFUL RENDER ---
    return (
        <div className='py-8'>
            <Container>
                <PostForm post={post} />
            </Container>
        </div>
    );
}

export default EditPost;