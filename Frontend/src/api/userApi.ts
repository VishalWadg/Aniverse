import { baseApi } from "./baseApi";

type UserProfileResponse = {
    username: string,
    name: string,
    email: string,
    role: string,
    profilePictureUrl: string,
    bio: string
}

const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getUserProfile: build.query<UserProfileResponse, string>({
            query: (username: string) => ({
                url: `/users/${username}`,
                method: 'GET',
            }),
            providesTags: (result: UserProfileResponse, error, username) => [{ type: 'User' as const, id: username }]
        })
    }),
    overrideExisting: false
})

export const { useGetUserProfileQuery } = userApi