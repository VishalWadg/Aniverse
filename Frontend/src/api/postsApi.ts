import { baseApi } from "./baseApi";

type Post = {
    id: number
    title: string
    content: string
    author: {
        username: string
    }
}

type PostsResponse = {
    content: Post[]
}

type CreatePostInput = {
    title: string
    content: string
}

type UpdatePostInput = {
    id: number
    updates: {
        title: string
        content: string
    }
}

const postsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getPosts: build.query<PostsResponse, void>({
            query: () => ({
                url: '/posts',
                method: 'GET',
            }),
            providesTags:  (result) => 
                result
                ?[
                    ...result.content.map((post) => ({type: 'Post' as const, id: post.id})),
                    {type: 'Post' as const, id: 'LIST'},
                ]
                : [{type : 'Post' as const, id:'LIST'}]
        }),

        getPost : build.query<Post, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{type: 'Post', id}]
        }),

        createPost : build.mutation<Post, CreatePostInput>({
            query: (postData) => ({
                url: `/posts`,
                method: 'POST',
                data: postData,
            }),
            invalidatesTags: [{type : 'Post' as const, id:'LIST'}]
        }),

        updatePost: build.mutation<Post, UpdatePostInput>({
            query: ({id, updates}) => ({
                url: `/posts/${id}`,
                method:'PUT', 
                data: updates,
            }),
            invalidatesTags : (result, error, {id}) => [
                {type: 'Post' as const, id },
                {type: 'Post' as const, id: 'LIST'}
            ]
        }),

        deletePost: build.mutation<void, number>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags : (result, error, id) => [
                {type:'Post' as const, id},
                {type: 'Post' as const, id : 'LIST'},
            ],
        })
    }),
    overrideExisting: false,
})

export const { 
    useGetPostsQuery, 
    useGetPostQuery, 
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation
} = postsApi
