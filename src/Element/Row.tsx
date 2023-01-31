import "./Row.css";
import {
  useCallback,
  useMemo,
  useState,
  useLayoutEffect,
  ReactNode,
} from "react";
import { useNavigate, Link } from "react-router-dom";

import { default as NEvent } from "Nostr/Event";
import ProfileImage from "Element/ProfileImage";
import RowText from "Element/RowText";

import { eventLink, getReactions, hexToBech32 } from "Util";
import NoteFooter from "Element/NoteFooter";
import NoteTime from "Element/NoteTime";
import EventKind from "Nostr/EventKind";
import { useUserProfiles } from "Feed/ProfileFeed";
import { TaggedRawEvent, u256 } from "Nostr";
import { useInView } from "react-intersection-observer";
import useModeration from "Hooks/useModeration";

export interface NoteProps {
  data?: TaggedRawEvent;
  isThread?: boolean;
  related: TaggedRawEvent[];
  highlight?: boolean;
  ignoreModeration?: boolean;
  options?: {
    showHeader?: boolean;
    showTime?: boolean;
    showFooter?: boolean;
  };
  ["data-ev"]?: NEvent;
}

const HiddenNote = ({ children }: any) => {
  const [show, setShow] = useState(false);
  return show ? (
    children
  ) : (
    <div className="card note hidden-note">
      <div className="header">
        <p>This note was hidden because of your moderation settings</p>
        <button onClick={() => setShow(true)}>Show</button>
      </div>
    </div>
  );
};

export default function Note(props: NoteProps) {
  const navigate = useNavigate();
  const {
    data,
    isThread,
    related,
    highlight,
    options: opt,
    ["data-ev"]: parsedEvent,
    ignoreModeration = false,
  } = props;
  const ev = useMemo(() => parsedEvent ?? new NEvent(data), [data]);
  const pubKeys = useMemo(() => ev.Thread?.PubKeys || [], [ev]);
  const users = useUserProfiles(pubKeys);
  const deletions = useMemo(
    () => getReactions(related, ev.Id, EventKind.Deletion),
    [related]
  );
  const { isMuted } = useModeration();
  const isOpMuted = isMuted(ev.PubKey);
  const { ref, inView, entry } = useInView({ triggerOnce: true });
  const [extendable, setExtendable] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);

  const options = {
    showHeader: true,
    showTime: true,
    showFooter: true,
    ...opt,
  };

  const transformBody = useCallback(() => {
    let body = ev?.Content ?? "";
    if (deletions?.length > 0) {
      return <b className="error">Deleted</b>;
    }
    return <RowText content={body} tags={ev.Tags} users={users || new Map()} />;
  }, [ev]);

  useLayoutEffect(() => {
    if (entry && inView && extendable === false) {
      let h = entry?.target.clientHeight ?? 0;
      if (h > 650) {
        setExtendable(true);
      }
    }
  }, [inView, entry, extendable]);

  function goToEvent(e: any, id: u256) {
    if (!window.location.pathname.startsWith("/e/")) {
      e.stopPropagation();
      navigate(eventLink(id));
    }
  }

  function replyTag() {
    if (ev.Thread === null) {
      return null;
    }

    const maxMentions = 2;
    let replyId = ev.Thread?.ReplyTo?.Event ?? ev.Thread?.Root?.Event;
    let mentions: { pk: string; name: string; link: ReactNode }[] = [];
    for (let pk of ev.Thread?.PubKeys) {
      const u = users?.get(pk);
      const npub = hexToBech32("npub", pk);
      const shortNpub = npub.substring(0, 12);
      if (u) {
        mentions.push({
          pk,
          name: u.name ?? shortNpub,
          link: (
            <Link to={`/p/${npub}`}>{u.name ? `@${u.name}` : shortNpub}</Link>
          ),
        });
      } else {
        mentions.push({
          pk,
          name: shortNpub,
          link: <Link to={`/p/${npub}`}>{shortNpub}</Link>,
        });
      }
    }
    mentions.sort((a, b) => (a.name.startsWith("npub") ? 1 : -1));
    let othersLength = mentions.length - maxMentions;
    const renderMention = (m: any, idx: number) => {
      return (
        <>
          {idx > 0 && ", "}
          {m.link}
        </>
      );
    };
    const pubMentions =
      mentions.length > maxMentions
        ? mentions?.slice(0, maxMentions).map(renderMention)
        : mentions?.map(renderMention);
    const others =
      mentions.length > maxMentions
        ? ` & ${othersLength} other${othersLength > 1 ? "s" : ""}`
        : "";
    return (
      <div className="reply">
        {(mentions?.length ?? 0) > 0 ? (
          <>
            {pubMentions}
            {others}
          </>
        ) : replyId ? (
          hexToBech32("note", replyId)?.substring(0, 12) // todo: link
        ) : (
          ""
        )}
      </div>
    );
  }

  if (ev.Kind !== EventKind.TextNote) {
    return (
      <>
        <h4>Unknown event kind: {ev.Kind}</h4>
        <pre>{JSON.stringify(ev.ToObject(), undefined, "  ")}</pre>
      </>
    );
  }

  function content() {
    if (!inView) return null;
    return (
      <>
        <div className="row-grid">
          <div className="col1">
            <ProfileImage
              pubkey={ev.RootPubKey}
              subHeader={replyTag() ?? undefined}
            />
          </div>
          <div className="body" onClick={(e) => goToEvent(e, ev.Id)}>
            {transformBody()}
          </div>
          <NoteTime from={ev.CreatedAt * 1000} />
          <NoteFooter ev={ev} related={related} />
        </div>
      </>
    );
  }

  const note = (
    <div className={`note card`} ref={ref}>
      {content()}
    </div>
  );

  return !ignoreModeration && isOpMuted ? (
    <HiddenNote>{note}</HiddenNote>
  ) : (
    note
  );
}
