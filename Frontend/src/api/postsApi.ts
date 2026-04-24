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
        })
    }),
    overrideExisting: false,
})

export const { useGetPostsQuery, useGetPostQuery } = postsApi
