import type { CurrentUserProfile, PublicUserProfile } from "@/api/userApi"
import UserAvatar from "./UserAvatar"

const formatJoinDate = (value?: string) => {
    if (!value) {
        return "Recently"
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return "Recently"
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(date)
}

const UserProfile = ({
    profile,
    isCurrentUser = false,
    isEditing = false,
    onToggleEdit,
}: {
    profile: PublicUserProfile | CurrentUserProfile
    isCurrentUser?: boolean
    isEditing?: boolean
    onToggleEdit?: () => void
}) => {
    const canShowEmail = isCurrentUser && "email" in profile

    return (
        <section className="relative overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,69,58,0.24),_transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7a70]/50 to-transparent" />

            <div className="flex justify-end">
                {onToggleEdit ? (
                    <button
                        type="button"
                        onClick={onToggleEdit}
                        aria-label={isEditing ? "Close profile editor" : "Open profile editor"}
                        className={[
                            "inline-flex size-11 items-center justify-center border transition",
                            isEditing
                                ? "border-[#ff453a]/50 bg-[#ff453a]/10 text-[#ffb4ae] hover:bg-[#ff453a]/15"
                                : "border-white/10 bg-transparent text-[#d4d4d4] hover:bg-white/[0.05] hover:text-white",
                        ].join(" ")}
                    >
                        {isEditing ? <CloseIcon className="size-4" /> : <PencilIcon className="size-4" />}
                    </button>
                ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex shrink-0 flex-col items-start gap-3 sm:w-[9.5rem]">
                    <UserAvatar
                        userName={profile.name || profile.username}
                        profileUrl={profile.profilePic}
                        size="lg"
                        className="size-24 data-[size=lg]:size-24"
                    />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center border border-[#ff453a]/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ff9d96]">
                                    {profile.role}
                                </span>
                                <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#8d8d8d]">
                                    Member since {formatJoinDate(profile.createdAt)}
                                </span>
                            </div>

                            <div>
                                <h1 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-[2.6rem]">
                                    {profile.name}
                                </h1>
                                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff9d96]">
                                    @{profile.username}
                                </p>
                            </div>
                        </div>

                        <p className="max-w-2xl text-base leading-8 text-[#bbbbbb]">
                            {profile.bio || "No bio yet. This profile is still waiting for its opening monologue."}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-[#c7c7c7]">
                            <div className="min-w-[10rem] border border-white/8 bg-black/25 px-4 py-3">
                                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#777777]">
                                    Published
                                </p>
                                <p className="mt-2 text-2xl font-black text-white">{profile.postCount}</p>
                            </div>

                            {canShowEmail ? (
                                <div className="min-w-[14rem] border border-white/8 bg-black/25 px-4 py-3">
                                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#777777]">
                                        Contact
                                    </p>
                                    <p className="mt-2 truncate text-sm text-[#e8e8e8]">{profile.email}</p>
                                </div>
                            ) : null}
                        </div>
                </div>
            </div>
        </section>
    )
}

function PencilIcon({ className = "" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
    )
}

function CloseIcon({ className = "" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="m6 6 12 12" />
            <path d="M18 6 6 18" />
        </svg>
    )
}

export default UserProfile
