import { baseApi } from "./baseApi";

export interface Tag {
    id: string; // UUID in backend
    name: string;
    description?: string;
    githubLabelId?: number;
}
export const tagsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllTags: builder.query<Tag[], void>({
            query: () => ({
                url: '/tags',
                method: 'GET',
            }),
            providesTags: ['Tag'],
        }),
        suggestTags: builder.mutation<Tag[], { query: string }>({
            query: (payload) => ({
                url: '/tags/suggest',
                method: 'POST',
                data: payload, // sends { query: "user description..." }
            }),
            invalidatesTags: ['Tag'],
        }),
    }), 
});

export const {
    useGetAllTagsQuery,
    useSuggestTagsMutation,
} = tagsApi;