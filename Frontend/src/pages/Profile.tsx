import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Container } from '@/components'
import { uploadImageToCloudinary } from '@/api/uploadApi'
import { getApiErrorMessage } from '@/lib/errorUtils'
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

  const defaultValues = useMemo(() => ({
    name: currentProfile?.name ?? '',
    email: currentProfile?.email ?? '',
    bio: currentProfile?.bio ?? '',
    profilePic: currentProfile?.profilePic ?? '',
  }), [currentProfile]);

  const isDirty = Boolean(
    currentProfile &&
      (formValues.name !== defaultValues.name ||
        formValues.email !== defaultValues.email ||
        formValues.bio !== defaultValues.bio ||
        formValues.profilePic !== defaultValues.profilePic)
  );

  useEffect(() => {
    if (currentProfile) {
      setFormValues(defaultValues)
    }
  }, [currentProfile, defaultValues])

  useEffect(() => {
    if (!isViewingOwnProfile) {
      setIsEditingProfile(false)
    }
  }, [isViewingOwnProfile])

  const profile = isViewingOwnProfile ? currentProfile : publicProfile
  const profileError = isViewingOwnProfile ? currentProfileError : publicProfileError
  const isProfileLoading = isViewingOwnProfile ? isCurrentProfileLoading : isPublicProfileLoading

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleReset = () => {
    if (currentProfile) {
      setFormValues(defaultValues)
    }
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

    if (!isDirty) {
      return
    }

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
            <div className="h-64 animate-pulse rounded-card border border-outline-variant bg-surface-container/30" />
            <div className="h-56 animate-pulse rounded-card border border-outline-variant bg-surface-container/20" />
          </div>
        </Container>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="relative overflow-hidden py-10 sm:py-14">
        <Container>
          <section className="border border-error/30 bg-error/10 p-card rounded-card">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-error">
              Profile unavailable
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface">
              We couldn&apos;t load this profile.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-on-surface-variant">
              {getApiErrorMessage(profileError)}
            </p>
          </section>
        </Container>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden py-10 sm:py-14">
      {/* Fully dynamic brand accent glow gradient! */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,_var(--primary)_10%,_transparent),_transparent_38%),radial-gradient(circle_at_bottom_right,_color-mix(in_srgb,_var(--primary)_6%,_transparent),_transparent_34%)]" />

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
            <section className="border border-outline-variant bg-surface-container-low p-card rounded-card shadow-elevation-1">
              {isEditingProfile ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-on-surface-variant">
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
                      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-on-surface-variant">
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
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-on-surface-variant">
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
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-control bg-primary px-5 h-control-h text-sm font-black uppercase tracking-[0.16em] text-on-primary transition hover:bg-primary/95">
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
                      variant="outline"
                      onClick={() => setFormValues((current) => ({ ...current, profilePic: '' }))}
                      className="px-4 text-on-surface-variant hover:text-on-surface"
                    >
                      Remove avatar
                    </Button>
                  </div>

                  <label className="space-y-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-on-surface-variant">
                      Bio
                    </span>
                    <textarea
                      name="bio"
                      value={formValues.bio}
                      onChange={handleInputChange}
                      placeholder="Tell readers what kind of theories you write."
                      maxLength={280}
                      rows={6}
                      className="flex w-full rounded-control border border-outline-variant bg-surface-container px-control-x py-control-y text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-primary focus:bg-surface-container-high focus-visible:ring-[3px] focus-visible:ring-primary/20"
                    />
                    <p className="text-right text-[11px] font-medium uppercase tracking-[0.22em] text-on-surface-variant/50">
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
                        !formValues.email.trim() ||
                        !isDirty
                      }
                      className="px-5 font-black uppercase tracking-[0.16em]"
                    >
                      {isUpdatingProfile ? 'Saving...' : 'Save profile'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="px-4 text-on-surface-variant hover:text-on-surface"
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
          username={profile.username}
          canInteract={authStatus}
        />
      </Container>
    </div>
  )
}

export default Profile
