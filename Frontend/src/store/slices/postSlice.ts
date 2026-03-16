// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import postApi from '../../api/postApi'; // Import your centralized API

// // --- 1. THE THUNK (The Async Action) ---
// // This handles the API call and the 3 states (pending, fulfilled, rejected) automatically.
// export const getPosts = createAsyncThunk(
//     'posts/getAll', // Action name prefix
//     async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
//         try {
//             // The payload returned here becomes 'action.payload' in fulfilled
//             const response = await postApi.getAll(page, size);
//             return response; 
//         } catch (error) {
//             // This return becomes 'action.payload' in rejected
//             return rejectWithValue(error.response?.data?.message || error.message);
//         }
//     }
// );

// const postSlice = createSlice({
//     name: 'posts',
//     initialState: {
//         posts: [],
//         totalPages: 0,
//         totalElements: 0,
//         loading: false,
//         error: null
//     },
//     reducers: {
//         // Only synchronous actions go here (like clearing data on logout)
//         clearPosts: (state) => {
//             state.posts = [];
//             state.loading = false;
//             state.error = null;
//         }
//     },
//     // --- 2. EXTRA REDUCERS (Listening to the Thunk) ---
//     extraReducers: (builder) => {
//         builder
//             // A. Request Started
//             .addCase(getPosts.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             // B. Request Successful
//             .addCase(getPosts.fulfilled, (state, action) => {
//                 state.loading = false;
//                 // Spring Boot returns 'content' for the list
//                 state.posts = action.payload.content; 
//                 state.totalPages = action.payload.totalPages;
//                 state.totalElements = action.payload.totalElements;
//             })
//             // C. Request Failed
//             .addCase(getPosts.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload; // The message from rejectWithValue
//             });
//     }
// });

// export const { clearPosts } = postSlice.actions;
// export default postSlice.reducer;