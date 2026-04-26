import React from 'react';
import EditorialFeed from '../components/feed/EditorialFeed';
import { useGetPostsQuery } from '@/api/postsApi';
import { useAppSelector } from '@/store/hooks';

function Home() {
    const {data, error, isLoading} = useGetPostsQuery(); 
    const posts = data?.content ?? [];
    const authStatus = useAppSelector((state) => state.auth.status);
    if(isLoading){
        return <p>Loading...</p>
    }
    if(error){
        let errorMessage = 'Something went wrong';
        if('status' in error){
            errorMessage = `Error:${error.status} ${typeof error.data === 'object' ? JSON.stringify(error.data) : error.data}`;
        }else if('message' in error){
            errorMessage =  error.message ?? errorMessage;
        }
        return <p>{errorMessage}</p>
    }
    return <EditorialFeed posts={posts} authStatus={authStatus} mode="home" />;
}

export default Home;
