import {useArtworkColor} from '@/lib/artworkColor';
import {loadAppearance} from './appearance';
import { useEffect, useState } from "react";
import { native } from "./api";
import { usePlayer } from "@/state/player";
import { applyAudio } from "./audio";
export function DesktopChrome() {
  const [error, setError] = useState("");
  const art=usePlayer(s=>s.nowPlaying?.artworkUrl);const color=useArtworkColor(art);
  useEffect(()=>{if(loadAppearance().dynamic&&color)document.documentElement.style.setProperty('--ambient-color',color.background);},[color]);
  useEffect(() => {
    const off = native.on("media", (cmd) => {
      const s = usePlayer.getState();
      if (cmd === "toggle") s.togglePlay();
      if (cmd === "next") s.next();
      if (cmd === "previous") s.previous();
      if (cmd === "pause" && s.status === "playing") s.togglePlay();
    });
    let last = "",
      started = 0,
      seconds = 0,
      sent = false,
      lastTick = Date.now();
    const timer = setInterval(() => {
      const s = usePlayer.getState(),
        track = s.queue[s.index]?.track,
        now = Date.now();
      if (track && s.status === "playing") {
        if (track.videoId !== last) {
          last = track.videoId;
          started = now;
          seconds = 0;
          sent = false;
          void native
            .call("record", { track })
            .catch((e) => setError(String(e)));
          void native
            .call("nowPlaying", { track, playing: true, notify: true })
            .catch((e) => setError(String(e)));
        }
        seconds += Math.min(2, (now - lastTick) / 1000);
        if (
          !sent &&
          (track.durationSec ?? 0) > 30 &&
          seconds >= Math.min(240, (track.durationSec ?? 480) / 2)
        ) {
          sent = true;
          void native
            .call("scrobble", { track, started })
            .catch((e) => setError(String(e)));
        }
      }
      lastTick = now;
    }, 1000);
    const unsub = usePlayer.subscribe((s, old) => {
      if (
        s.deck !== old.deck ||
        (s.status === "playing" && old.status !== "playing")
      )
        void applyAudio().catch((e) => setError(String(e)));
      if (s.status !== old.status) {
        const track = s.queue[s.index]?.track;
        if (track)
          void native
            .call("nowPlaying", {
              track,
              playing: s.status === "playing",
              notify: false,
            })
            .catch(() => {});
      }
    });
    const drop = (e: DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length)
        void native
          .importDropped(files)
          .then((r) => {
            window.dispatchEvent(new Event("library-changed"));
            if (r.errors.length) setError(r.errors.join("\n"));
          })
          .catch((e) => setError(String(e)));
    };
    const over = (e: DragEvent) => e.preventDefault();
    window.addEventListener("drop", drop);
    window.addEventListener("dragover", over);
    return () => {
      off();
      unsub();
      clearInterval(timer);
      window.removeEventListener("drop", drop);
      window.removeEventListener("dragover", over);
    };
  }, []);
  return (
    <>
      <header className="desktop-title">
        <img src="/favicon.svg" alt="" />
        <span>
          BitChord <small>Music for Windows</small>
        </span>
        <div className="window-actions">
          {[
            ["minimize", "−"],
            ["maximize", "□"],
            ["close", "×"],
          ].map(([action, label]) => (
            <button
              key={action}
              aria-label={action}
              onClick={() => void native.call("window", { action })}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      {error && (
        <div role="alert" className="desktop-error">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}
    </>
  );
}
