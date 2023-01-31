import "./AvatarImage.css";
import Nostrich from "../nostrich.jpg";
import { CSSProperties } from "react";
import type { UserMetadata } from "Nostr";


const Avatar = ({ user }: { user?: UserMetadata, onClick?: () => void}) => {
    const avatarUrl = (user?.picture?.length ?? 0) === 0 ? Nostrich : user?.picture
    const backgroundImage = `url(${avatarUrl})`
    const style = { '--img-url': backgroundImage } as CSSProperties
    return (
        <div
          style={style}
          className="avatar-image"
        >
        </div>
    )
}

export default Avatar
