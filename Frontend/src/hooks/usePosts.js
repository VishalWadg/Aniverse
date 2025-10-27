import { useEffect } from "react";
import { fetchPostsStart, fetchPostsSuccess, fetchPostsFailure } from '../store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import appwriteService from "../Appwrite/config";

function usePosts(){
    
    const posts = useSelector((state) => state.posts.posts)
    const loading = useSelector((state) => state.posts.loading);
    const error = useSelector((state) => state.posts.error)
    const dispatch = useDispatch();
    const authStatus = useSelector((state) => state.auth.status);
    useEffect(() => {
        if(authStatus){
            dispatch(fetchPostsStart())
            appwriteService
            .getPosts()
            .then((posts) => {
                if (posts.rows) {
                    dispatch(fetchPostsSuccess({posts: posts.rows}))
                }
            })
            .catch((error) => {
                dispatch(fetchPostsFailure({error: error.message}))
            })
        }
    }, [authStatus, dispatch])

    return [posts, loading, error]
}

export default usePosts