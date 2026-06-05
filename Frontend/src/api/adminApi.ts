import axios from "axios";
import { baseApi } from "./baseApi";
import { PostsResponse, Post } from "./postsApi";


const adminApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getDeletedPosts: build.query<PostsResponse, void>({
            query: () => ({
                url: '/posts/deleted',
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.content.map(post => ({ type: 'Post' as const, id: post.id })),
                        { type: 'Post' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Post' as const, id: 'LIST' }]
        }),

        restorePost: build.mutation<Post, string>({
            query: (id) => ({
                url: `/posts/restore/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Post' as const, id },
                { type: 'Post' as const, id: 'LIST' },
            ],
        }),

        purgePost: build.mutation<void, string>({
            query: (id) => ({
                url: `/posts/cleanup/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Post' as const, id },
                { type: 'Post' as const, id: 'LIST' },
            ],
        }),

        cleanupDeletedPosts: build.mutation<number, void>({
            query: () => ({
                url: '/posts/cleanup',
                method: 'DELETE',
            }),
            invalidatesTags: () => [
                { type: 'Post' as const, id: 'LIST' },
            ],
        })
    }),
    overrideExisting: false
})

export const {
    useGetDeletedPostsQuery,
    useRestorePostMutation,
    usePurgePostMutation,
    useCleanupDeletedPostsMutation
} = adminApi