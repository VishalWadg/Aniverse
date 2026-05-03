import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { getInitials } from "@/lib/post-helpers";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const UserAvatar = ({
    userName,
    profileUrl,
    className,
    size = "default",
}: {
    userName: string
    profileUrl?: string | null
    className?: string
    size?: "default" | "sm" | "lg"
}) => {
    const avatar = useMemo(() => {
        if (profileUrl) return profileUrl
        return createAvatar(adventurer, {
            seed: userName || "anonymous",
        }).toDataUri()
    }, [userName, profileUrl])

    return (
        <Avatar
            size={size}
            className={cn("border border-white/10 bg-white/[0.04] after:border-white/10", className)}
        >
            <AvatarImage src={avatar} alt={userName} />
            <AvatarFallback className="bg-[#241413] font-black uppercase tracking-[0.16em] text-[#ffb4ae]">
                {getInitials(userName)}
            </AvatarFallback>
        </Avatar>
    )
}

export default UserAvatar
