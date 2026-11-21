import { usePlayer, getPlayhead } from "@/state/player";
import { useUi } from "@/state/ui";
import { useEffect, useState } from "react";
import { MediaMode } from "./MediaMode";
import { native } from "./api";
export function NowPlaying() {
  const s = usePlayer();
  const expanded=useUi(s=>s.fullScreen);
  const [time, setTime] = useState(0),
    [message, setMessage] = useState("");
  useEffect(() => {
    const t = setInterval(() => setTime(getPlayhead()?.sec || 0), 500);
    return () => clearInterval(t);
  }, []);
  const track = s.nowPlaying;
  if (!track)
    return (
      <div className="desktop-card">
        <h2>Your next favorite is waiting</h2>
        <p>
          Play a local song or an available online track to open artwork, lyrics
          and queue controls.
        </p>
      </div>
    );
  return (
    <>
      <div className="desktop-card now-playing-hero">
        {track.artworkUrl ? (
          <img
            className="now-playing-cover"
            src={track.artworkUrl}
            alt="Album artwork"
          />
        ) : (
          <div
            className="now-playing-cover"
            role="img"
            aria-label="No album artwork"
          />
        )}
        <div>
          <div className="desktop-eyebrow">NOW PLAYING</div>
          <h2>{track.title}</h2>
          <p>{track.artist}</p>
          <div>
            <button aria-pressed={s.shuffle} onClick={s.toggleShuffle}>
              Shuffle
            </button>
            <button onClick={s.previous}>Previous</button>
            <button onClick={s.togglePlay}>
              {s.status === "playing" ? "Pause" : "Play"}
            </button>
            <button onClick={s.next}>Next</button>
            <button onClick={s.cycleRepeat}>Repeat: {s.repeat}</button>
          </div>
          <label>
            Playback progress
            <input
              aria-label="Now Playing progress"
              type="range"
              min="0"
              max={track.durationSec || 1}
              step="0.1"
              value={Math.min(time, track.durationSec || 1)}
              onChange={(e) => s.seek(Number(e.target.value))}
            />
          </label>
          <p>
            {Math.floor(time / 60)}:
            {String(Math.floor(time % 60)).padStart(2, "0")}<span className="total-duration"> /{" "}
            {Math.floor(track.durationSec / 60)}:
            {String(Math.floor(track.durationSec % 60)).padStart(2, "0")}</span>
          </p>
          <label>
            Volume
            <input
              aria-label="Now Playing volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={s.volume}
              onChange={(e) => s.setVolume(Number(e.target.value))}
            />
          </label>
          <button onClick={s.toggleMute}>{s.muted ? "Unmute" : "Mute"}</button>
          <button onClick={() => useUi.getState().toggleSidePanel("up-next")}>
            Queue
          </button>
          <button onClick={() => useUi.getState().toggleSidePanel("lyrics")}>
            Lyrics
          </button>
          <button onClick={() => useUi.getState().setFullScreen(true)}>
            Full-screen player
          </button>
          <button
            onClick={async () => {
              try {
                const t = s.queue[s.index]?.track;
                if (t) await native.call("favorite", { track: t });
                setMessage("Favorite updated");
              } catch (e) {
                setMessage(String(e));
              }
            }}
          >
            Favorite
          </button>
          <p role="status">{message}</p>
          <p>
            Service downloads are unavailable here. Use Downloads for explicitly
            permitted direct audio files.
          </p>
        </div>
      </div>
      {!expanded&&<MediaMode />}
    </>
  );
}
