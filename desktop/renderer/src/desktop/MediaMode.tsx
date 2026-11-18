import { useEffect, useRef, useState } from "react";
import { getAudio, usePlayer } from "@/state/player";
import { native } from "./api";
import { setLocalVideo } from "./localVideo";
export function MediaMode() {
  const track = usePlayer((s) => s.nowPlaying);
  const [mode, setMode] = useState<"audio" | "video">("audio"),
    [error, setError] = useState(""),
    [full, setFull] = useState(false),
    [controls, setControls] = useState(true);
  const pending=useRef<{url:string;pos:number;playing:boolean;rate:number}|null>(null);
  const video = useRef<HTMLVideoElement>(null),
    surface = useRef<HTMLDivElement>(null),
    hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cleanup(resume=false) {
    const v = video.current;
    const position=v?.currentTime||0,playing=v&&!v.paused;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    setLocalVideo(null);
    if(resume&&playing&&document.documentElement.dataset.playbackShutdown!=='true'&&usePlayer.getState().nowPlaying?.videoId===track?.videoId){const a=getAudio();if(a){a.currentTime=position;void a.play().catch(()=>{});}}
    if (hide.current) clearTimeout(hide.current);
  }
  useEffect(() => {
    setMode("audio");
    setError("");
    return () => cleanup(true);
  }, [track?.videoId]);
  useEffect(()=>{document.documentElement.dataset.videoFullscreen=String(full);return()=>{document.documentElement.dataset.videoFullscreen='false';};},[full]);
  async function fullscreen(){try{await native.call('videoFullscreen',{enabled:!full});setFull(!full);}catch{setError('Fullscreen could not start. Retry the Fullscreen button.');}}
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
      if(e.key==='Escape'&&(full||document.fullscreenElement)){e.preventDefault();e.stopImmediatePropagation();if(document.fullscreenElement)void document.exitFullscreen();else void native.call('videoFullscreen',{enabled:false});setFull(false);}

    };
    document.addEventListener("fullscreenchange", change);
    window.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      window.removeEventListener("keydown", key, true);
    };
  }, [mode, full]);
  useEffect(()=>{if(mode!=='video'||!video.current||!pending.current)return;const v=video.current,p=pending.current;pending.current=null;setLocalVideo(v);v.src=p.url;v.volume=usePlayer.getState().muted?0:usePlayer.getState().volume;v.playbackRate=p.rate;v.onloadedmetadata=()=>{v.currentTime=p.pos;if(!v.videoWidth){setError('This container has no supported video picture. Audio mode has been restored.');cleanup();setMode('audio');const a=getAudio();if(a){a.currentTime=p.pos;if(p.playing)void a.play().catch(()=>{});}return;}if(p.playing)void v.play().catch(()=>setError('Press Play in the video controls to start playback.'));};v.load();},[mode]);
  async function switchMode(next: "audio" | "video") {
    if (!track || next === mode) return;
    if (!track.videoId.startsWith("local:")) {
      setError(
        "This mode switch supports local media. Provider content requires its supported player.",
      );
      return;
    }
    try {
      const a = getAudio();
      if (next === "video") {
        const p = await native.call("track", { id: track.videoId });
      if(!/\.(mp4|webm)$/i.test(p.track.path||'')){setError('This is an audio file. Keep Audio mode to display its artwork; choose a local MP4/WebM file for video.');return;}
        const pos = a?.currentTime || 0,
          playing = a && !a.paused;
        a?.pause();
        pending.current={url:p.url,pos,playing:!!playing,rate:a?.playbackRate||1};
        setMode('video');
      } else {
        const v = video.current,
          pos = v?.currentTime || 0,
          playing = v && !v.paused;
        if (document.fullscreenElement) await document.exitFullscreen();
        cleanup();
        setMode("audio");
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
    <div className="desktop-card">
      <div role="group" aria-label="Local playback mode">
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
      {mode === "video" && (
        <div
          ref={surface}
          className="video-stage"
          data-fullscreen={full}
          data-controls={controls}
          onDoubleClick={e=>{e.preventDefault();void fullscreen();}}
          onMouseMove={showControls}
          onFocus={showControls}
        >
          <video
            ref={video}
            controls
            onPlay={() => usePlayer.setState({ status: "playing" })}
            onPause={() => usePlayer.setState({ status: "paused" })}
            onEnded={() => usePlayer.getState().next()}
            onError={() =>
              setError(
                "The video codec is unsupported or the file has no video track. Try Audio mode.",
              )
            }
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
      <p role="status">
        {error ||
          "Local MP4/WebM video: use Fullscreen, double-click or F11. Escape restores the previous layout."}
      </p>
    </div>
  );
}
