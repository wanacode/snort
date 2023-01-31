import "./Root.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { RootState } from "State/Store";
import { NoteCreator } from "Element/NoteCreator";
import Timeline from "Element/Timeline";
import { HexKey } from "Nostr";
import { TimelineSubject } from "Feed/TimelineFeed";

const RootTab = {
    Posts: 0,
    PostsAndReplies: 1,
    Global: 2,
    Blah: 33
};

export default function RootPage() {
    const [show, setShow] = useState(false)
    const [loggedOut, pubKey, follows] = useSelector<RootState, [boolean | undefined, HexKey | undefined, HexKey[]]>(s => [s.login.loggedOut, s.login.publicKey, s.login.follows]);
    const [tab, setTab] = useState(RootTab.Global);

    const isGlobal = loggedOut || tab === RootTab.Global;
    const timelineSubect: TimelineSubject = isGlobal ? { type: "global", items: [] } : { type: "pubkey", items: follows };
    return (
        <>
            {/* {pubKey ? <>
                <div className="tabs">
                    <div className={`tab f-1 ${tab === RootTab.Global ? "active" : ""}`} onClick={() => setTab(RootTab.Global)}>
                        Global
                    </div>
                </div></> : null} */}
            <Timeline key={tab} subject={timelineSubect} postsOnly={tab === RootTab.Blah} method={"TIME_RANGE"} />
            {/* <NoteCreator replyTo={undefined} autoFocus={true} show={show} setShow={setShow} /> */}
        </>
    );
}
