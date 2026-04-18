import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';
import postApi from '../api/postApi';
import EditorialFeed from '../components/feed/EditorialFeed';

// --- 1. THE LOADER ---
// This runs BEFORE the component renders.
export const homeLoader = async ({ request }) => {
    try {
        // Default to page 0, size 10. 
        // In the future, you can read URLSearchParams here for pagination.
        const posts = await postApi.getPosts({ signal: request.signal });
        return posts;
    } catch (err) {
        // If API fails (e.g., server down), return empty structure
        // so the page doesn't crash. The ErrorElement will catch critical failures.
        console.log("Unable to load public home feed");
        return { content: [] };
    }
};

function Home() {
    const data = useLoaderData() as any; 
    const posts = data?.content || [];
    const authStatus = useSelector((state: any) => state.auth.status);

    return <EditorialFeed posts={posts} authStatus={authStatus} mode="home" />;
}

export default Home;
