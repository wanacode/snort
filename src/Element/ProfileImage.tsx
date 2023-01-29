import "./ProfileImage.css";

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserProfile } from "Feed/ProfileFeed";
import { hexToBech32, profileLink } from "Util";
import Avatar from "Element/Avatar"
import Nip05 from "Element/Nip05";
import { HexKey } from "Nostr";
import { MetadataCache } from "State/Users";

export interface ProfileImageProps {
    pubkey: HexKey,
    subHeader?: JSX.Element,
    showUsername?: boolean,
    className?: string,
    link?: string,
    isUser?: string
};

export default function ProfileImage({ pubkey, subHeader, showUsername = true, className, link, isUser }: ProfileImageProps) {
    const navigate = useNavigate();
    const user = useUserProfile(pubkey);

    const name = useMemo(() => {
        return getDisplayName(user, pubkey);
    }, [user, pubkey]);

    return (
        <div className={`pfp${className ? ` ${className}` : ""}`}>
            <div className="avatar-wrapper">
                {isUser == "me" && <>{console.log("USER", user)}</>}
                
                <Avatar user={user} onClick={() => navigate(link ?? profileLink(pubkey))} />
            </div>
            {showUsername && (<div className="f-grow pointer" onClick={e => { e.stopPropagation(); navigate(link ?? profileLink(pubkey)) }}>
                <div className="profile-name">
                    <div>{name}</div>
                    {user?.nip05 && <Nip05 nip05={user.nip05} pubkey={user.pubkey} />}
                </div>
                {subHeader ? <>{subHeader}</> : null}
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
