import { baseApi } from './baseApi';
import { Tag } from './tagApi';
// ==========================================
// TYPES & INTERFACES
// ==========================================



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

export interface Attachment {
    url: string;
    publicId: string; // Cloudinary public ID
}

export interface CreateFeedbackPayload {
    content: string;
    tagIds: string[]; // UUIDs of the selected tags
    attachments: string[]; // Array of attachment URLs
}

// ==========================================
// RTK QUERY SLICE
// ==========================================

export const feedbackApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        
        // 2. Submit new feedback
        createFeedback: builder.mutation<Feedback, CreateFeedbackPayload>({
            query: (payload) => ({
                url: '/feedbacks',
                method: 'POST',
                data: payload,
            }),
            invalidatesTags: ['Feedback'],
        }),

        

    }),
});

export const {
    useCreateFeedbackMutation,
} = feedbackApi;
