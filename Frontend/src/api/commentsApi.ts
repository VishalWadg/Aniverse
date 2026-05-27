import { baseApi } from "./baseApi";

export interface CommentAuthor {
    id: number
    username: string
    profilePic: string
}

export interface Comment {
    id: number
    content: string
    createdAt: string
    author: CommentAuthor
}

export interface CommentResponse {
    content: Comment[]
    pageable : {pageNumber: number, pageSize: number}
    totalPages: number
    totalElements: number
    last: boolean
}

export const commentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getComments: builder.query<CommentResponse, {postId: number, page?: number}>({
            query: ({ postId, page = 0 }) => ({
                url: `/posts/${postId}/comments?page=${page}&size=10&sort=createdAt,asc`,
                method: 'GET'
            }),
            serializeQueryArgs: ({queryArgs}) =>{
                return queryArgs.postId;
            },
            merge: (currentCache, newItems) => {
                if(!newItems.content) return;
                const combined = [...currentCache.content, ...newItems.content];
                const uniqueItemsMap = new Map(combined.map(item => [item.id, item]));
                const deduplicatedArray = Array.from(uniqueItemsMap.values());
                Object.assign(currentCache, newItems);
                currentCache.content = deduplicatedArray;
            },
            forceRefetch({currentArg, previousArg}){
                return currentArg?.page !== previousArg?.page;
            },
            providesTags: (result, error, {postId}) => [{type: 'Comment', id: `POST-${postId}`}],
        }),

        createComment: builder.mutation<Comment, {postId: number, content: string}>({
            query: ({postId, content}) => ({
                url: `/posts/${postId}/comments`,
                method: 'POST',
                data: {content},
            }),
            invalidatesTags: (result, error, {postId}) => [{type: 'Comment', id: `POST-${postId}`}],
        }),
        
        updateComment: builder.mutation<Comment, {postId: number, commentId: number, content: string}>({
            query: ({commentId, content}) => ({
                url: `/comments/${commentId}`,
                method: "PUT",
                data: {content}
            }),
            invalidatesTags: (result, error, {postId}) => [{type: 'Comment', id: `POST-${postId}`}],
        }),

        deleteComment: builder.mutation<void, {postId: number, commentId: number}>({
            query: ({commentId}) => ({
                url: `/comments/${commentId}`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, {postId}) => [{type: 'Comment', id: `POST-${postId}`}],
        }),
    }),
})

export const {
    useGetCommentsQuery,
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
} = commentsApi;