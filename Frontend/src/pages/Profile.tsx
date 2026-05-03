import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Container } from '@/components'
import { useGetPostsByUsernameQuery } from '@/api/postsApi'
import { uploadImageToCloudinary } from '@/api/uploadApi'
import {
  useGetCurrentUserProfileQuery,
  useGetUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} from '@/api/userApi'
import useToasts from '@/hooks/useToasts'
import { setUserData } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import UserPosts from '@/components/User/UserPosts'
import UserProfileCard from '@/components/User/UserProfile'

const getApiErrorMessage = (error: unknown) => {
  if (!error) {
    return 'Something went wrong.'
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as { status?: number; data?: any }

    if (typeof apiError.data === 'string' && apiError.data.trim()) {
      return apiError.data
    }

    if (apiError.data && typeof apiError.data === 'object') {
      if (typeof apiError.data.message === 'string' && apiError.data.message.trim()) {
        return apiError.data.message
      }

      if (typeof apiError.data.error === 'string' && apiError.data.error.trim()) {
        return apiError.data.error
      }
    }

    if (apiError.status) {
      return `Request failed with status ${apiError.status}.`
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Something went wrong.'
}

function Profile() {
  const { username: routeUsername = '' } = useParams()
  const authStatus = useAppSelector((state) => state.auth.status)
  const authUser = useAppSelector((state) => state.auth.userData)
  const dispatch = useAppDispatch()
  const toasts = useToasts()
  const isViewingOwnProfile = Boolean(authStatus && authUser?.username === routeUsername)

  const {
    data: currentProfile,
    isLoading: isCurrentProfileLoading,
    error: currentProfileError,
  } = useGetCurrentUserProfileQuery(undefined, {
    skip: !isViewingOwnProfile,
  })

  const {
    data: publicProfile,
    isLoading: isPublicProfileLoading,
    error: publicProfileError,
  } = useGetUserProfileQuery(routeUsername, {
    skip: !routeUsername || isViewingOwnProfile,
  })

  const [updateCurrentUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateCurrentUserProfileMutation()

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    bio: '',
    profilePic: '',
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!currentProfile) {
      return
    }

    setFormValues({
      name: currentProfile.name ?? '',
      email: currentProfile.email ?? '',
      bio: currentProfile.bio ?? '',
      profilePic: currentProfile.profilePic ?? '',
    })
  }, [currentProfile])

  useEffect(() => {
    if (!isViewingOwnProfile) {
      setIsEditingProfile(false)
    }
  }, [isViewingOwnProfile])

  const profile = isViewingOwnProfile ? currentProfile : publicProfile
  const profileError = isViewingOwnProfile ? currentProfileError : publicProfileError
  const isProfileLoading = isViewingOwnProfile ? isCurrentProfileLoading : isPublicProfileLoading

  const { data: postsResponse, isLoading: isPostsLoading, error: postsError } =
    useGetPostsByUsernameQuery(profile?.username ?? '', {
      skip: !profile?.username,
    })

  const posts = postsResponse?.content ?? []

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleReset = () => {
    if (!currentProfile) {
      return
    }

    setFormValues({
      name: currentProfile.name ?? '',
      email: currentProfile.email ?? '',
      bio: currentProfile.bio ?? '',
      profilePic: currentProfile.profilePic ?? '',
    })
  }

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploadingAvatar(true)

    try {
      const uploadResponse = await toasts.promise(uploadImageToCloudinary(file), {
        loading: 'Uploading avatar...',
        success: 'Avatar uploaded.',
        error: 'Failed to upload avatar',
      })

      if (!uploadResponse?.secure_url) {
        throw new Error('Cloudinary did not return a secure image URL.')
      }

      setFormValues((current) => ({
        ...current,
        profilePic: uploadResponse.secure_url,
      }))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const updatedProfile = await toasts.promise(
      updateCurrentUserProfile({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        bio: formValues.bio,
        profilePic: formValues.profilePic.trim(),
      }).unwrap(),
      {
        loading: 'Saving profile...',
        success: 'Profile updated.',
        error: 'Failed to save profile',
      }
    )

    dispatch(
      setUserData({
        id: updatedProfile.id,
        username: updatedProfile.username,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        profilePic: updatedProfile.profilePic ?? null,
        bio: updatedProfile.bio ?? null,
      })
    )

    setIsEditingProfile(false)
  }

  if (isProfileLoading) {
    return (
      <div className="relative overflow-hidden py-10 sm:py-14">
        <Container>
          <div className="space-y-6">
            <div className="h-64 animate-pulse border border-white/10 bg-white/[0.03]" />
            <div className="h-56 animate-pulse border border-white/8 bg-white/[0.02]" />
          </div>
        </Container>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="relative overflow-hidden py-10 sm:py-14">
        <Container>
          <section className="border border-[#ff453a]/35 bg-[#1a0f0d] px-6 py-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#ff9d96]">
              Profile unavailable
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
              We couldn&apos;t load this profile.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#c8b3af]">
              {getApiErrorMessage(profileError)}
            </p>
          </section>
        </Container>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,69,58,0.1),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_34%)]" />

      <Container className="relative space-y-8">
        <div
          className={
            isViewingOwnProfile && isEditingProfile
              ? 'grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start'
              : ''
          }
        >
          <UserProfileCard
            profile={profile}
            isCurrentUser={isViewingOwnProfile}
            isEditing={isEditingProfile}
            onToggleEdit={isViewingOwnProfile ? () => setIsEditingProfile((current) => !current) : undefined}
          />

          {isViewingOwnProfile && currentProfile ? (
            <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
              {isEditingProfile ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7d7d7d]">
                        Display name
                      </span>
                      <Input
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        placeholder="How your name appears publicly"
                        minLength={3}
                        maxLength={50}
                        required
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7d7d7d]">
                        Email
                      </span>
                      <Input
                        name="email"
                        type="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        maxLength={100}
                        required
                      />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7d7d7d]">
                      Avatar URL
                    </span>
                    <Input
                      name="profilePic"
                      value={formValues.profilePic}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      maxLength={2048}
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-none bg-[#ff453a] px-5 py-2.5 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#ff6258]">
                      {isUploadingAvatar ? 'Uploading...' : 'Upload avatar'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      />
                    </label>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setFormValues((current) => ({ ...current, profilePic: '' }))}
                      className="rounded-none border border-white/10 bg-transparent px-4 text-[#d4d4d4] hover:bg-white/[0.05] hover:text-white"
                    >
                      Remove avatar
                    </Button>
                  </div>

                  <label className="space-y-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7d7d7d]">
                      Bio
                    </span>
                    <textarea
                      name="bio"
                      value={formValues.bio}
                      onChange={handleInputChange}
                      placeholder="Tell readers what kind of theories you write."
                      maxLength={280}
                      rows={6}
                      className="flex w-full rounded-none border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-[#e5e5e5] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-colors placeholder:text-[#666666] focus:border-[#ff453a]/70 focus:bg-white/[0.04] focus-visible:ring-[3px] focus-visible:ring-[#ff453a]/20"
                    />
                    <p className="text-right text-[11px] font-medium uppercase tracking-[0.22em] text-[#666666]">
                      {formValues.bio.length}/280
                    </p>
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={
                        isUpdatingProfile ||
                        isUploadingAvatar ||
                        !formValues.name.trim() ||
                        !formValues.email.trim()
                      }
                      className="rounded-none bg-[#ff453a] px-5 font-black uppercase tracking-[0.16em] text-white hover:bg-[#ff6258]"
                    >
                      {isUpdatingProfile ? 'Saving...' : 'Save profile'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleReset}
                      className="rounded-none border border-white/10 bg-transparent px-4 text-[#d4d4d4] hover:bg-white/[0.05] hover:text-white"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              ) : null}
            </section>
          ) : null}
        </div>

        <UserPosts
          posts={posts}
          username={profile.username}
          isLoading={isPostsLoading}
          errorMessage={postsError ? getApiErrorMessage(postsError) : null}
          canInteract={authStatus}
        />
      </Container>
    </div>
  )
}

export default Profile
