// import { useEffect } from "react";
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchPosts } from '../store/postSlice'; // Import the Thunk

// function usePosts(page = 0, size = 10) { // Accept pagination params
    
//     const dispatch = useDispatch();
    
//     // Select state
//     const { posts, loading, error } = useSelector((state) => state.posts);
//     const authStatus = useSelector((state) => state.auth.status);

//     useEffect(() => {
//         // Only fetch if logged in
//         if (authStatus) {
//             // Dispatch the Thunk
//             dispatch(fetchPosts({ page, size }));
//         }
//     }, [authStatus, dispatch, page, size]);

//     // Return an Object (Order doesn't matter)
//     return { posts, loading, error };
// }

// export default usePosts;