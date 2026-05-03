import { baseApi } from "./baseApi";

export type PublicUserProfile = {
    id: number
    username: string
    name: string
    role: string
    profilePic?: string | null
    bio?: string | null
    createdAt: string
    postCount: number
}

export type CurrentUserProfile = PublicUserProfile & {
    email: string
}

export type UpdateUserProfileInput = {
    name: string
    email: string
    bio?: string
    profilePic?: string
}

const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getUserProfile: build.query<PublicUserProfile, string>({
            query: (username: string) => ({
                url: `/users/profile/${username}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, username) => [{ type: 'User' as const, id: username }]
        }),
        getCurrentUserProfile: build.query<CurrentUserProfile, void>({
            query: () => ({
                url: '/users/me',
                method: 'GET',
            }),
            providesTags: (result) =>
                result?.username
                    ? [
                        { type: 'User' as const, id: 'ME' },
                        { type: 'User' as const, id: result.username },
                    ]
                    : [{ type: 'User' as const, id: 'ME' }],
        }),
        updateCurrentUserProfile: build.mutation<CurrentUserProfile, UpdateUserProfileInput>({
            query: (profileData) => ({
                url: '/users/me',
                method: 'PATCH',
                data: profileData,
            }),
            invalidatesTags: (result) =>
                result?.username
                    ? [
                        { type: 'User' as const, id: 'ME' },
                        { type: 'User' as const, id: result.username },
                        { type: 'Post' as const, id: 'LIST' },
                        { type: 'Post' as const, id: `${result.username}-LIST` },
                    ]
                    : [
                        { type: 'User' as const, id: 'ME' },
                        { type: 'Post' as const, id: 'LIST' },
                    ],
        }),
    }),
    overrideExisting: false
})

export const {
    useGetUserProfileQuery,
    useGetCurrentUserProfileQuery,
    useUpdateCurrentUserProfileMutation,
} = userApi

export default userApi
