import { baseApi } from "./baseApi";

export type Post = {
    id: string
    title: string
    content: string
    createdAt: string
    isDeleted?: boolean
    author: {
        username: string
        name?: string
        profilePic?: string | null
        role?: string
    }
}

export type PostsResponse = {
    content: Post[],
    number: number,
    totalPages: number,
    last: boolean
}

type CreatePostInput = {
    title: string
    content: string
}

type UpdatePostInput = {
    id: string
    updates: {
        title: string
        content: string
    }
}

const DEFAULT_POSTS_PAGE_SIZE = 10;

type PostsQueryArgs = {
    sort?: string
    page: number
    size?: number
}

type UserPostsQueryArgs = PostsQueryArgs & {
    username: string
}

const postsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getPosts: build.query<PostsResponse, PostsQueryArgs>({
            query: ({sort='createdAt,desc', page = 0, size = DEFAULT_POSTS_PAGE_SIZE}) => ({
                url: `/public/posts?sort=${sort}&page=${page}&size=${size}`,
                method: 'GET',
            }),
            serializeQueryArgs: ({endpointName, queryArgs}) => {
                return `${endpointName}-${queryArgs.sort || 'createdAt,desc'}-${queryArgs.size || DEFAULT_POSTS_PAGE_SIZE}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if(!newItems.content) return;

                if (arg.page === 0) {
                    Object.assign(currentCache, newItems);
                    return;
                }

                const combined = [...currentCache.content, ...newItems.content];
                const uniqueItemsMap = new Map(combined.map(item => [item.id, item]));
                const deduplicatedArray = Array.from(uniqueItemsMap.values());
                Object.assign(currentCache, newItems);
                currentCache.content = deduplicatedArray;
            },
            forceRefetch({currentArg, previousArg}){
                return currentArg?.page !== previousArg?.page || currentArg?.size !== previousArg?.size;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.content.map((post) => ({ type: 'Post' as const, id: post.id })),
                        { type: 'Post' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Post' as const, id: 'LIST' }]
        }),

        getPost: build.query<Post, string>({
            query: (id) => ({
                url: `/public/posts/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Post', id }]
        }),

        createPost: build.mutation<Post, CreatePostInput>({
            query: (postData) => ({
                url: `/posts`,
                method: 'POST',
                data: postData,
            }),
            invalidatesTags: [{ type: 'Post' as const, id: 'LIST' }]
        }),

        updatePost: build.mutation<Post, UpdatePostInput>({
            query: ({ id, updates }) => ({
                url: `/posts/${id}`,
                method: 'PUT',
                data: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Post' as const, id },
                { type: 'Post' as const, id: 'LIST' }
            ]
        }),

        deletePost: build.mutation<void, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Post' as const, id },
                { type: 'Post' as const, id: 'LIST' },
            ],
        }),

        getPostsByUsername: build.query<PostsResponse, UserPostsQueryArgs>({
            query: ({username, sort='createdAt,desc', page=0, size = DEFAULT_POSTS_PAGE_SIZE}) => ({
                url: `/public/posts/user/${username}?sort=${sort}&page=${page}&size=${size}`,
                method: 'GET',
            }),
            serializeQueryArgs: ({endpointName, queryArgs}) => {
                return `${endpointName}-${queryArgs.username}-${queryArgs.sort || 'createdAt,desc'}-${queryArgs.size || DEFAULT_POSTS_PAGE_SIZE}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if(!newItems.content) return;

                if (arg.page === 0) {
                    Object.assign(currentCache, newItems);
                    return;
                }

                const combinedArr = [...currentCache.content, ...newItems.content];
                const uniqueItemsMap = new Map(combinedArr.map(item => [item.id, item]));
                const deduplicatedArray = Array.from(uniqueItemsMap.values());
                Object.assign(currentCache, newItems);
                currentCache.content = deduplicatedArray; 
            },
            forceRefetch({currentArg, previousArg}){
                return currentArg?.page !== previousArg?.page || currentArg?.size !== previousArg?.size;
            },
            providesTags: (result, error, {username}) =>
                result
                    ? [
                        ...result.content.map((post) => ({ type: 'Post' as const, id: post.id })),
                        { type: 'Post' as const, id: `${username}-LIST` },
                    ]
                    : [{ type: 'Post' as const, id: `${username}-LIST` }]
        })
    }),
    overrideExisting: false,
})

export const {
    useGetPostsQuery,
    useGetPostQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useGetPostsByUsernameQuery
} = postsApi
