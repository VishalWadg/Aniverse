import { baseApi } from './baseApi';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Tag {
    id: string; // UUID in backend
    name: string;
    description?: string;
    githubLabelId?: number;
}

export interface Feedback {
    id: string; // UUID
    content: string;
    attachments: string[];
    impactCount: number;
    status: 'NEW' | 'IN_REVIEW' | 'LINKED' | 'RESOLVED' | 'DISMISSED';
    githubIssueId?: number;
    createdAt: string;
    tags: Tag[];
}

export interface CreateFeedbackPayload {
    content: string;
    tagIds: string[]; // UUIDs of the selected tags
    attachments: string[]; // Cloudinary URLs
}

// ==========================================
// RTK QUERY SLICE
// ==========================================

export const feedbackApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        
        // 1. Fetch tags (for the Combobox)
        getTags: builder.query<Tag[], void>({
            query: () => ({
                url: '/tags',
                method: 'GET',
            }),
            providesTags: ['Tag'],
        }),

        // 2. Submit new feedback
        createFeedback: builder.mutation<Feedback, CreateFeedbackPayload>({
            query: (payload) => ({
                url: '/feedbacks',
                method: 'POST',
                data: payload,
            }),
            invalidatesTags: ['Feedback'],
        }),

        // 3. (Epic 2.4 Placeholder) Get Tag Suggestions by text similarity
        suggestTags: builder.query<Tag[], string>({
            query: (text) => ({
                url: '/tags/suggest',
                method: 'GET',
                params: { text }
            }),
        })

    }),
});

export const {
    useGetTagsQuery,
    useCreateFeedbackMutation,
    useSuggestTagsQuery // For later!
} = feedbackApi;
