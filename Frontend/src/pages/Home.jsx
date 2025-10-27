import React, {useEffect, useState} from 'react'
import appwriteService from "../Appwrite/config";
import {Container, PostCard} from '../components'
import usePosts from '../hooks/usePosts';
import { useSelector } from 'react-redux';


function Home() {
    
    const [posts, loading, error] = usePosts();
    const authStatus = useSelector((state) => state.auth.status);
  
    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold hover:text-gray-500">
                                {authStatus? "There are no posts to view creat one..": error !== null? error : loading? "Loading..." : "Login to view posts"}
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Home