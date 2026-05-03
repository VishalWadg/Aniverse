import { useGetUserProfileQuery } from "@/api/usersApi"

const UserProfile = () => {
    const { data, isLoading, error } = useGetUserProfileQuery()
    return (
        <div>UserProfile</div>
    )
}

export default UserProfile