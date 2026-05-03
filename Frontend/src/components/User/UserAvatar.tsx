
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMemo } from "react"
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";

const UserAvatar = ({ userName, profileUrl }: { userName: string, profileUrl?: string }) => {
    const avatar = useMemo(() => {
        if (profileUrl) {
            return profileUrl
        }
        return createAvatar(adventurer, {
            seed: userName,
        }).toDataUri();
    }, [userName, profileUrl])

    const fallbackImages = [
        'public/avatars/akaza.png',
        'public/avatars/giyu.png',
        'public/avatars/gojo.png',
        'public/avatars/goku.png',
        'public/avatars/jiraya.png',
        'public/avatars/megumi.png',
        'public/avatars/minato.png',
        'public/avatars/naruto.png',
        'public/avatars/nezuko.png',
        'public/avatars/rengoku.png',
        'public/avatars/sanemi.png',
        'public/avatars/sasuke.png',
        'public/avatars/shinobu.png',
        'public/avatars/tobi.png',
        'public/avatars/zenitsu.png',
    ]

    const fallbackAvatar = fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    return (
        <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback><AvatarImage src={fallbackAvatar} /></AvatarFallback>
        </Avatar>
    )
}

export default UserAvatar