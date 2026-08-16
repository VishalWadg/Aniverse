import { baseApi } from "./baseApi";

export type FeedbackGroupStatus = 'PENDING' | 'APPROVED' | 'DISCARDED' | 'RESOLVED';

export interface Tag {
  id: string;
  name: string;
  githubLabelId?: number;
}

export interface FeedbackItem {
  id: string;
  content: string;
  attachments?: string[];
  tags?: Tag[];
  createdAt: string;
}

export interface FeedbackGroup {
  id: string;
  title: string;
  status: FeedbackGroupStatus;
  githubIssueNumber?: number;
  githubIssueUrl?: string;
  impactCount: number;
  feedbacks: FeedbackItem[];
  createdAt: string;
}

export interface FeedbackGroupsResponse {
  content: FeedbackGroup[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface ApproveGroupPayload {
  groupId: string;
  title: string;
  body: string;
  labels?: string[];
}

export interface MoveFeedbackPayload {
  feedbackId: string;
  targetGroupId?: string;
  createNewGroup: boolean;
}

export const adminFeedbackApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFeedbackGroups: build.query<FeedbackGroupsResponse, { status: FeedbackGroupStatus; page?: number }>({
      query: ({ status, page = 0 }) => ({
        url: `/admin/feedback-groups?status=${status}&page=${page}&size=10`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((group) => ({ type: 'FeedbackGroup' as const, id: group.id })),
              { type: 'FeedbackGroup' as const, id: 'LIST' },
            ]
          : [{ type: 'FeedbackGroup' as const, id: 'LIST' }],
    }),

    approveFeedbackGroup: build.mutation<FeedbackGroup, ApproveGroupPayload>({
      query: ({ groupId, ...body }) => ({
        url: `/admin/feedback-groups/${groupId}/approve`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [{ type: 'FeedbackGroup' as const, id: 'LIST' }],
    }),

    discardFeedbackGroup: build.mutation<FeedbackGroup, string>({
      query: (groupId) => ({
        url: `/admin/feedback-groups/${groupId}/discard`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'FeedbackGroup' as const, id: 'LIST' }],
    }),

    restoreFeedbackGroup: build.mutation<FeedbackGroup, string>({
      query: (groupId) => ({
        url: `/admin/feedback-groups/${groupId}/restore`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'FeedbackGroup' as const, id: 'LIST' }],
    }),

    moveFeedbackItem: build.mutation<void, MoveFeedbackPayload>({
      query: ({ feedbackId, ...body }) => ({
        url: `/admin/feedback-groups/items/${feedbackId}/move`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [{ type: 'FeedbackGroup' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeedbackGroupsQuery,
  useApproveFeedbackGroupMutation,
  useDiscardFeedbackGroupMutation,
  useRestoreFeedbackGroupMutation,
  useMoveFeedbackItemMutation,
} = adminFeedbackApi;
