import axiosClient from "./axiosClient";

type RequestOptions = {
    signal?: AbortSignal;
};

const postApi = {
    // Fetch all posts
    getPosts: async (options: RequestOptions = {}) => {
        const response = await axiosClient.get('/posts', options);
        return response.data; // Returns an array of post objects
    },

    getPost: async (postId, options: RequestOptions = {}) => {
        const response = await axiosClient.get(`/posts/${postId}`, options)
        return response.data; // Returns a single post object
    },

    createPost: async (postData) => {
        const response = await axiosClient.post('/posts', postData);
        return response.data; // Returns the created post object
    },

    // PATCH /api/posts/{id}
    updatePost: async (id, updates) => {
        const response = await axiosClient.put(`/posts/${id}`, updates);
        return response.data;
    },

    // DELETE /api/posts/{id}
    deletePost: async (id) => {
        await axiosClient.delete(`/posts/${id}`);
    }

}

export default postApi;
