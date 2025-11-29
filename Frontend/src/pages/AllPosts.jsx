import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { Container, PostCard } from '../components';

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
    // 2. Get Data
    const data = useLoaderData();
    const posts = data?.content || [];

    // 3. Render Logic
    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold hover:text-gray-500">
                                No posts found.
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.id} className='p-2 w-1/4'>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}

export default AllPosts;