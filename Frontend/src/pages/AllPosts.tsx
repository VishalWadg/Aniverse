import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EditorialFeed from '../components/feed/EditorialFeed';

// 1. Loader Logic (Runs BEFORE render)
// We can reuse the same loader logic as Home if needed, or customize it.
// For AllPosts, you might want a larger page size.
import postApi from '../api/postApi';

export const allPostsLoader = async () => {
    try {
        // Fetch Page 0 with size 20 for the full list
        return await postApi.getPosts();
    } catch (error) {
        // Return empty content on error so UI doesn't break
        return { content: [] };
    }
};

function AllPosts() {
    const data = useLoaderData() as any;
    const posts = data?.content || [];
    const authStatus = useSelector((state: any) => state.auth.status);

    return <EditorialFeed posts={posts} authStatus={authStatus} mode="archive" />;
}

export default AllPosts;
