import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import postApi from '../api/postApi';
import { Container, PostCard } from '../components';
import { getMemoryToken } from '../api/axiosClient';

// --- 1. THE LOADER ---
// This runs BEFORE the component renders.
export const homeLoader = async () => {
    if (getMemoryToken()=== null) {
        return { content: [] }; // Return empty list immediately
    }
    try {
        // Default to page 0, size 10. 
        // In the future, you can read URLSearchParams here for pagination.
        const posts = await postApi.getPosts();
        return posts;
    } catch (err) {
        // If API fails (e.g., server down), return empty structure
        // so the page doesn't crash. The ErrorElement will catch critical failures.
        console.log("Not authenticated, showing home without posts");
        return { content: [] };
    }
};

function Home() {
    // --- 2. GET DATA ---
    const data = useLoaderData(); 
    const posts = data?.content || []; // specific to Spring Boot Page format
    
    // --- 3. GET AUTH STATE ---
    const authStatus = useSelector((state) => state.auth.status);

    // --- 4. RENDER LOGIC ---
    
    // Case A: User is NOT logged in
    if (!authStatus) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold hover:text-gray-500">
                                <Link to="/login">Login to read posts</Link>
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // Case B: Logged in, but NO posts found
    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="p-2 w-full">
                        <h1 className="text-2xl font-bold hover:text-gray-500">
                            No posts yet. <Link to="/add-post" className="text-blue-500">Create one?</Link>
                        </h1>
                    </div>
                </Container>
            </div>
        );
    }

    // Case C: Logged in AND Posts exist
    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.id} className='p-2 w-1/4'>
                            {/* Ensure PostCard accepts standard props. 
                                Spreading {...post} passes: id, title, content, author 
                            */}
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}

export default Home;