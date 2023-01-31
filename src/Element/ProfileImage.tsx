import "./ProfileImage.css";

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserProfile } from "Feed/ProfileFeed";
import { hexToBech32, profileLink } from "Util";
import AvatarImage from "Element/AvatarImage"
import Nip05 from "Element/Nip05";
import { HexKey } from "Nostr";
import { MetadataCache } from "State/Users";

export interface ProfileImageProps {
    pubkey: HexKey,
    subHeader?: JSX.Element,
    showUsername?: boolean,
    className?: string,
    link?: string
};

export default function ProfileImage({ pubkey, subHeader, showUsername = true, className, link }: ProfileImageProps) {
    const navigate = useNavigate();
    const user = useUserProfile(pubkey);

    const name = useMemo(() => {
        return getDisplayName(user, pubkey);
    }, [user, pubkey]);

    return (
        <div className={`pfp${className ? ` ${className}` : ""}`}>
            <div className="avatar-wrapper">
                <AvatarImage user={user} onClick={() => navigate(link ?? profileLink(pubkey))} />
            </div>
            {showUsername && (
              <div className="profile-name f-grow">
                <div className="subheader">
                  {subHeader}
                </div>
              </div>
            )}
        </div>
    )
}

export function getDisplayName(user: MetadataCache | undefined, pubkey: HexKey) {
    let name = hexToBech32("npub", pubkey).substring(0, 12);
    if ((user?.display_name?.length ?? 0) > 0) {
        name = user!.display_name!;
    } else if ((user?.name?.length ?? 0) > 0) {
        name = user!.name!;
    }
    return name;
}
