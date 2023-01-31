import { useEffect, useState } from "react";

const MinuteInMs = 1_000 * 60;
const HourInMs = MinuteInMs * 60;
const DayInMs = HourInMs * 24;

export interface NoteTimeProps {
    from: number,
    fallback?: string
}

export default function NoteTime(props: NoteTimeProps) {
    const [time, setTime] = useState<string>();
    const { from, fallback } = props;
    const absoluteTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'long'}).format(from);
    const isoDate = new Date(from).toISOString();
    const showTime = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: 'numeric'
      }).format(from);

    function calcTime() {
        let fromDate = new Date(from);
        let ago = (new Date().getTime()) - from;
        let absAgo = Math.abs(ago);
        if (absAgo > DayInMs) {
            return fromDate.toLocaleDateString(undefined, { year: "2-digit", month: "short", day: "2-digit", weekday: "short" });
        } else if (absAgo > HourInMs) {
            return `${fromDate.getHours().toString().padStart(2, '0')}:${fromDate.getMinutes().toString().padStart(2, '0')}`;
        } else if (absAgo < MinuteInMs) {
            return fallback
        } else {
            let mins = Math.floor(absAgo / MinuteInMs);
            if(ago < 0) {
                return `in ${mins}m`; 
            }
            return `${mins}m`;
        }
    }

    useEffect(() => {
        setTime(calcTime());
        let t = setInterval(() => {
            setTime(s => {
                let newTime = calcTime();
                if (newTime !== s) {
                    return newTime;
                }
                return s;
            })
        }, MinuteInMs);
        return () => clearInterval(t);
    }, [from]);

    return <time dateTime={isoDate} title={absoluteTime}>{showTime}</time>
}
