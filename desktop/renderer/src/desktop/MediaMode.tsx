import { useEffect, useRef, useState } from "react";
import { getAudio, usePlayer } from "@/state/player";
import { native } from "./api";
import { setLocalVideo,getLocalVideo } from "./localVideo";
export function MediaMode({expanded=false}:{expanded?:boolean}) {
  const track = usePlayer((s) => s.nowPlaying);
  const [mode, setMode] = useState<"audio" | "video">("audio"),
    [error, setError] = useState(""),
    [full, setFull] = useState(false),
    [controls, setControls] = useState(true);
  const online = useRef<{
    id: string;
    position: number;
    playing: boolean;
  } | null>(null);
  const fullRef = useRef(false);
  const pending = useRef<{
    url: string;
    pos: number;
    playing: boolean;
    rate: number;
  } | null>(null);
  const ownedVideo=useRef<HTMLVideoElement|null>(null);
  const ownedPlaying=useRef(false);
  const generation=useRef(0);
  const video = useRef<HTMLVideoElement>(null),
    surface = useRef<HTMLDivElement>(null),
    hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cleanup(resume = false) {
    generation.current++;
    pending.current = null;
    if (online.current) {
      const p=online.current;
      online.current = null;
      if(resume&&usePlayer.getState().nowPlaying?.videoId===p.id){const a=getAudio();if(a){a.currentTime=p.position;if(p.playing)void a.play().catch(()=>{});}}
      void native.call("providerVideoClose").catch(() => {});
    }
    if (fullRef.current) {
      fullRef.current = false;
      void native.call("videoFullscreen", { enabled: false }).catch(() => {});
      document.documentElement.dataset.videoFullscreen = "false";
    }
    const v=ownedVideo.current||video.current;ownedVideo.current=null;setLocalVideo(null);
    const position = v?.currentTime || 0,
      playing = v && (!v.paused || ownedPlaying.current);
    ownedPlaying.current=false;
    if (v) {
      v.onloadedmetadata = null;
      v.onloadeddata = null;
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    setLocalVideo(null);
    if (
      resume &&
      playing &&
      document.documentElement.dataset.playbackShutdown !== "true" &&
      usePlayer.getState().nowPlaying?.videoId === track?.videoId
    ) {
      const a = getAudio();
      if (a) {
        a.currentTime = position;
        void a.play().catch(() => {});
      }
    }
    if (hide.current) clearTimeout(hide.current);
  }
  useEffect(() => {
    setMode("audio");
    setFull(false);
    setError("");
    return () => cleanup(true);
  }, [track?.videoId]);
  useEffect(() => {
    document.documentElement.dataset.videoFullscreen = String(full);
    return () => {
      document.documentElement.dataset.videoFullscreen = "false";
    };
  }, [full]);
  useEffect(
    () =>
      native.on("provider-video-closed", () => {
        const p = online.current;
        online.current = null;
        if (p && usePlayer.getState().nowPlaying?.videoId === p.id) {
          setMode("audio");
          const a = getAudio();
          if (a) {
            a.currentTime = p.position;
            if (p.playing) void a.play().catch(() => {});
          }
        }
      }),
    [],
  );
  async function fullscreen() {
    try {
      const next = !fullRef.current;
      await native.call("videoFullscreen", { enabled: next });
      fullRef.current = next;
      setFull(next);
    } catch {
      setError("Fullscreen could not start. Retry the Fullscreen button.");
    }
  }
  useEffect(() => {
    const change = () =>
      setFull(document.fullscreenElement === surface.current);
    const key = (e: KeyboardEvent) => {
      if (mode !== "video") return;
      if (e.key === "F11") {
        e.preventDefault();
        e.stopImmediatePropagation();
        void fullscreen();
      }
      if (e.key === "Escape" && (full || document.fullscreenElement)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (document.fullscreenElement) void document.exitFullscreen();
        else void native.call("videoFullscreen", { enabled: false });
        fullRef.current = false;
        setFull(false);
      }
    };
    document.addEventListener("fullscreenchange", change);
    window.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      window.removeEventListener("keydown", key, true);
    };
  }, [mode, full]);
  useEffect(() => {
    if (mode !== "video" || !video.current || !pending.current) return;
    const v = video.current,
      p = pending.current;
    pending.current = null;
    ownedVideo.current=v;setLocalVideo(v);
    v.src = p.url;
    v.volume = usePlayer.getState().muted ? 0 : usePlayer.getState().volume;
    v.playbackRate = p.rate;
    v.onloadedmetadata = () => {
      v.currentTime = p.pos;
      if (!v.videoWidth) {
        setError(
          "This container has no supported video picture. Audio mode has been restored.",
        );
        cleanup();
        setMode("audio");
        const a = getAudio();
        if (a) {
          a.currentTime = p.pos;
          if (p.playing) void a.play().catch(() => {});
        }
        return;
      }
      if (p.playing)
        void v
          .play()
          .catch(() =>
            setError("Press Play in the video controls to start playback."),
          );
    };
    v.load();
  }, [mode]);
  async function switchMode(next: "audio" | "video") {
    if (!track || next === mode) return;
    if (!track.videoId.startsWith("local:")) {
      try {
        if (next === "video") {
          const a = getAudio();
          const position = a?.currentTime || 0,
            playing = !!a && !a.paused;
          a?.pause();
          online.current = { id: track.videoId, position, playing };
          setMode("video");
          setError(
            "YouTube video opens in its official player window. Returning to Audio resumes the app position saved before this switch.",
          );
          await native.call("providerVideoOpen", {
            id: track.videoId,
            position,
          });
        } else {
          const p = online.current;
          online.current = null;
          await native.call("providerVideoClose");
          setMode("audio");
          const a = getAudio();
          if (p && a) {
            a.currentTime = p.position;
            if (p.playing) await a.play();
          }
        }
      } catch (e) {
        online.current = null;
        setMode("audio");
        setError(String(e));
      }
      return;
    }
    try {
      const a = getAudio();
      if (next === "video") {
        const selectedId = track.videoId;
        const selectedGeneration=generation.current;
        const p = await native.call("track", { id: selectedId });
        if (generation.current!==selectedGeneration || usePlayer.getState().nowPlaying?.videoId !== selectedId) return;
        if (!/\.(mp4|webm)$/i.test(p.track.path || "")) {
          setError(
            "This is an audio file. Keep Audio mode to display its artwork; choose a local MP4/WebM file for video.",
          );
          return;
        }
        const pos = a?.currentTime || 0,
          playing = a && !a.paused;
        a?.pause();
        pending.current = {
          url: p.url,
          pos,
          playing: !!playing,
          rate: a?.playbackRate || 1,
        };
        setMode("video");
      } else {
        const v = video.current,
          pos = v?.currentTime || 0,
          playing = v && (!v.paused || ownedPlaying.current);
        ownedPlaying.current=false;
        if (document.fullscreenElement) await document.exitFullscreen();
        cleanup();
        setMode("audio");
        setFull(false);
        if (a) {
          a.currentTime = pos;
          if (playing) await a.play();
        }
      }
    } catch (e) {
      setError(String(e));
    }
  }
  function showControls() {
    setControls(true);
    if (hide.current) clearTimeout(hide.current);
    hide.current = setTimeout(() => setControls(false), 2500);
  }
  return (
    <div className={expanded?"expanded-media-mode":"desktop-card"}>
      <div role="group" aria-label="Playback mode" className="media-mode-buttons">
        {(["audio", "video"] as const).map((v) => (
          <button
            key={v}
            aria-pressed={mode === v}
            onClick={() => void switchMode(v)}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>
      {mode === "video" && track?.videoId.startsWith("local:") && (
        <div
          ref={surface}
          className="video-stage"
          data-fullscreen={full}
          data-controls={controls}
          onDoubleClick={(e) => {
            e.preventDefault();
            void fullscreen();
          }}
          onMouseMove={showControls}
          onFocus={showControls}
        >
          <video
            ref={video}
            controls
            preload="auto"
            onPlay={() => {
              if(!video.current||getLocalVideo()!==video.current)return;
              ownedPlaying.current=true;
              usePlayer.setState({ status: "playing" });
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "playing";
            }}
            onPause={() => {
              if(!video.current||getLocalVideo()!==video.current)return;
              ownedPlaying.current=false;
              usePlayer.setState({ status: "paused" });
              if ("mediaSession" in navigator)
                navigator.mediaSession.playbackState = "paused";
            }}
            onEnded={() => usePlayer.getState().next()}
            onError={() => {
              const code = video.current?.error?.code;
              setError(
                code === 2
                  ? "Video could not be read. Check that the local file still exists."
                  : "This video codec cannot be decoded here. Try an H.264/AAC MP4 or VP8/Opus WebM, or open it in the Windows player below.",
              );
              cleanup();
              setMode("audio");
              setFull(false);
            }}
          />
          <button
            className="video-fullscreen"
            aria-label={
              full ? "Exit video fullscreen" : "Enter video fullscreen"
            }
            onClick={() => void fullscreen()}
          >
            {full ? "Exit fullscreen" : "Fullscreen"} · F11
          </button>
        </div>
      )}
      {error && track?.videoId.startsWith("local:") && (
        <div>
          <button
            onClick={() => {
              setError("");
              void switchMode("video");
            }}
          >
            Retry video
          </button>
          <button
            onClick={() =>
              void native
                .call("openLocalMedia", { id: track.videoId })
                .catch((e) => setError(String(e)))
            }
          >
            Open file in Windows player
          </button>
        </div>
      )}
      <p role="status">
        {error ||
          "Local MP4/WebM video: use Fullscreen, double-click or F11. Escape restores the previous layout."}
      </p>
    </div>
  );
}
