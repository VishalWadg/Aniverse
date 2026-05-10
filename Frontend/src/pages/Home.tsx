import React from 'react';
import EditorialFeed from '../components/feed/EditorialFeed';
import { useGetPostsQuery } from '@/api/postsApi';
import { useAppSelector } from '@/store/hooks';

function Home() {
    const authStatus = useAppSelector((state) => state.auth.status);
    return <EditorialFeed authStatus={authStatus} mode="home" />;
}

export default Home;
