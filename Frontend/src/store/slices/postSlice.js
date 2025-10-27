import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    posts: [],
    loading: false,
    error: null,
};

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        fetchPostsStart: (state) => {
            state.loading = true
            state.error = null
        },
        fetchPostsSuccess: (state, action) => {
            state.loading = false
            state.posts = action.payload.posts
        },
        fetchPostsFailure: (state, action) => {
            state.loading = false
            state.error = action.payload.error
        },
        clearPostsState: (state) => {
            state.posts = []
            state.loading = false
            state.error = null
        }
    }
});

export default postSlice.reducer;
export const {fetchPostsStart, fetchPostsFailure, fetchPostsSuccess, clearPostsState} = postSlice.actions;