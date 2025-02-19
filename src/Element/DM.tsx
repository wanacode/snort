import "./DM.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useInView } from 'react-intersection-observer';

import useEventPublisher from "Feed/EventPublisher";
import Event from "Nostr/Event";
import NoteTime from "Element/NoteTime";
import Text from "Element/Text";
import { setLastReadDm } from "Pages/MessagesPage";
import { RootState } from "State/Store";
import { HexKey, TaggedRawEvent } from "Nostr";
import { incDmInteraction } from "State/Login";

export type DMProps = {
    data: TaggedRawEvent
}

export default function DM(props: DMProps) {
    const dispatch = useDispatch();
    const pubKey = useSelector<RootState, HexKey | undefined>(s => s.login.publicKey);
    const publisher = useEventPublisher();
    const [content, setContent] = useState("Loading...");
    const [decrypted, setDecrypted] = useState(false);
    const { ref, inView } = useInView();
    const isMe = props.data.pubkey === pubKey;

    async function decrypt() {
        let e = new Event(props.data);
        let decrypted = await publisher.decryptDm(e);
        setContent(decrypted || "<ERROR>");
        if (!isMe) {
            setLastReadDm(e.PubKey);
            dispatch(incDmInteraction());
        }
    }

    useEffect(() => {
        if (!decrypted && inView) {
            setDecrypted(true);
            decrypt().catch(console.error);
        }
    }, [inView, props.data]);

    return (
        <div className={`flex dm f-col${isMe ? " me" : ""}`} ref={ref}>
            <div><NoteTime from={props.data.created_at * 1000} fallback={'Just now'} /></div>
            <div className="w-max">
                <Text content={content} tags={[]} users={new Map()} />
            </div>
        </div>
    )
}
