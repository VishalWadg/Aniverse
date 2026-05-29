import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { getInitials } from "@/lib/post-helpers";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const UserAvatar = ({
    userName,
    avatarSeed,
    profileUrl,
    className,
    size = "default",
}: {
    userName: string
    avatarSeed?: string
    profileUrl?: string | null
    className?: string
    size?: "default" | "sm" | "lg"
}) => {
    const avatar = useMemo(() => {
        if (profileUrl) return profileUrl
        return createAvatar(adventurer, {
            seed: avatarSeed || userName || "anonymous",
        }).toDataUri()
    }, [avatarSeed, userName, profileUrl])

    return (
        <Avatar
            size={size}
            className={cn("border border-outline-variant bg-surface-container after:border-outline-variant", className)}
        >
            <AvatarImage src={avatar} alt={userName} />
            <AvatarFallback className="bg-primary-container text-on-primary-container font-black uppercase tracking-[0.16em]">
                {getInitials(userName)}
            </AvatarFallback>
        </Avatar>
    )
}

export default UserAvatar
