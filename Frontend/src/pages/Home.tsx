import React from 'react';
import { useSelector } from 'react-redux';
import EditorialFeed from '../components/feed/EditorialFeed';
import { useGetPostsQuery } from '@/api/postsApi';

function Home() {
    const {data, error, isLoading, isFetching} = useGetPostsQuery(); 
    const posts = data?.content ?? [];
    const authStatus = useSelector((state: any) => state.auth.status);
    if(isLoading){
        return <p>Loading...</p>
    }
    if(error){
        let errorMessage = 'Something went wrong';
        if('status' in error){
            errorMessage = `Error:${error.status} ${error.data}`;
        }else if('message' in error){
            errorMessage =  error.message ?? errorMessage;
        }
        return <p>{errorMessage}</p>
    }
    return <EditorialFeed posts={posts} authStatus={authStatus} mode="home" />;
}

export default Home;
