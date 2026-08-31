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
      providesTags: (result, error, { status }) =>
        result
          ? [
              ...result.content.map((group) => ({ type: 'FeedbackGroup' as const, id: group.id })),
              { type: 'FeedbackGroup' as const, id: status },
              { type: 'FeedbackGroup' as const, id: 'LIST' },
            ]
          : [
              { type: 'FeedbackGroup' as const, id: status },
              { type: 'FeedbackGroup' as const, id: 'LIST' },
            ],
    }),

    approveFeedbackGroup: build.mutation<FeedbackGroup, ApproveGroupPayload>({
      query: ({ groupId, ...body }) => ({
        url: `/admin/feedback-groups/${groupId}/approve`,
        method: 'POST',
        data: body,
      }),
      async onQueryStarted({ groupId }, { dispatch, queryFulfilled }) {
        const patchPending = dispatch(
          adminFeedbackApi.util.updateQueryData('getFeedbackGroups', { status: 'PENDING', page: 0 }, (draft) => {
            if (draft?.content) {
              draft.content = draft.content.filter((g) => g.id !== groupId);
              draft.totalElements = Math.max(0, draft.totalElements - 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchPending.undo();
        }
      },
      invalidatesTags: [
        { type: 'FeedbackGroup' as const, id: 'PENDING' },
        { type: 'FeedbackGroup' as const, id: 'APPROVED' },
      ],
    }),

    discardFeedbackGroup: build.mutation<FeedbackGroup, string>({
      query: (groupId) => ({
        url: `/admin/feedback-groups/${groupId}/discard`,
        method: 'POST',
      }),
      async onQueryStarted(groupId, { dispatch, queryFulfilled }) {
        const patchPending = dispatch(
          adminFeedbackApi.util.updateQueryData('getFeedbackGroups', { status: 'PENDING', page: 0 }, (draft) => {
            if (draft?.content) {
              draft.content = draft.content.filter((g) => g.id !== groupId);
              draft.totalElements = Math.max(0, draft.totalElements - 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchPending.undo();
        }
      },
      invalidatesTags: [
        { type: 'FeedbackGroup' as const, id: 'PENDING' },
        { type: 'FeedbackGroup' as const, id: 'DISCARDED' },
      ],
    }),

    restoreFeedbackGroup: build.mutation<FeedbackGroup, string>({
      query: (groupId) => ({
        url: `/admin/feedback-groups/${groupId}/restore`,
        method: 'POST',
      }),
      async onQueryStarted(groupId, { dispatch, queryFulfilled }) {
        const patchDiscarded = dispatch(
          adminFeedbackApi.util.updateQueryData('getFeedbackGroups', { status: 'DISCARDED', page: 0 }, (draft) => {
            if (draft?.content) {
              draft.content = draft.content.filter((g) => g.id !== groupId);
              draft.totalElements = Math.max(0, draft.totalElements - 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchDiscarded.undo();
        }
      },
      invalidatesTags: [
        { type: 'FeedbackGroup' as const, id: 'PENDING' },
        { type: 'FeedbackGroup' as const, id: 'DISCARDED' },
      ],
    }),

    moveFeedbackItem: build.mutation<void, MoveFeedbackPayload>({
      query: ({ feedbackId, ...body }) => ({
        url: `/admin/feedback-groups/items/${feedbackId}/move`,
        method: 'POST',
        data: body,
      }),
      async onQueryStarted({ feedbackId }, { dispatch, queryFulfilled }) {
        const patchPending = dispatch(
          adminFeedbackApi.util.updateQueryData('getFeedbackGroups', { status: 'PENDING', page: 0 }, (draft) => {
            if (draft?.content) {
              draft.content.forEach((group) => {
                const initialCount = group.feedbacks.length;
                group.feedbacks = group.feedbacks.filter((item) => item.id !== feedbackId);
                if (group.feedbacks.length < initialCount) {
                  group.impactCount = Math.max(0, group.impactCount - 1);
                }
              });
              draft.content = draft.content.filter((group) => group.feedbacks.length > 0);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchPending.undo();
        }
      },
      invalidatesTags: [{ type: 'FeedbackGroup' as const, id: 'PENDING' }],
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
