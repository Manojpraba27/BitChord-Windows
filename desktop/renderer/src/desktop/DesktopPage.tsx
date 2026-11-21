import {TrackMenu} from "@/components/music/TrackMenu";
import {SpotifyLinkedPlaylist} from './SpotifyLinkedPlaylist';
import {NowPlaying} from './NowPlaying';
import {GoogleConnection} from './GoogleConnection';
import {YouTubeConnection} from './YouTubeConnection';
import {MediaMode} from './MediaMode';
import {SpotifyConnection} from './SpotifyConnection';
import {PlaylistEditor} from './PlaylistEditor';
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router";
import {
  FolderOpen,
  Download,
  Play,
  Heart,
  Plus,
  RefreshCw,
} from "lucide-react";
import { native } from "./api";
import { usePlayer } from "@/state/player";
import { useUi } from "@/state/ui";
import type { Track } from "@/data/music/types";
import { audioSettings, frequencies, saveAudio, sleep } from "./audio";
import "./desktop.css";
export default function DesktopPage() {
  const route = useLocation().pathname;
  const [tracks, setTracks] = useState<Track[]>([]),
    [jobs, setJobs] = useState<any[]>([]),
    [settings, setSettings] = useState<any>({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [url, setUrl] = useState(""),
    [permitted, setPermitted] = useState(false),
    [token, setToken] = useState(""),
    [clientId, setClientId] = useState(""),
    [key, setKey] = useState(""),
    [secret, setSecret] = useState(""),
    [devices, setDevices] = useState<MediaDeviceInfo[]>([]),
    [revision, setRevision] = useState(0),
    [playlists, setPlaylists] = useState<any[]>([]),
    [playlistTitle, setPlaylistTitle] = useState("");
  const current = usePlayer((s) => s.nowPlaying);
  const source = { type: "library" as const, title: "On this PC" };
  async function run(fn: () => Promise<any>, success = "Saved") {
    setBusy(true);
    setMessage("");
    try {
      const r = await fn();
      setMessage(r?.errors?.length ? r.errors.join("\n") : success);
      return r;
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    try {
      setSettings(await native.call("settings"));
      setPlaylists(await native.call("playlists"));
      setJobs(await native.call("downloads"));
      setTracks(
        await native.call(
          route === "/history"
            ? "history"
            : route === "/favorites"
              ? "favorites"
              : "library",
        ),
      );
    } catch (e) {
      setMessage(String(e));
    }
  }
  useEffect(() => {
    void refresh();
    const off = native.on("download", () => void refresh());
    const cb = () => void refresh();
    window.addEventListener("library-changed", cb);
    return () => {
      off();
      window.removeEventListener("library-changed", cb);
    };
  }, [route]);
  function play(t: Track) {
    if (t.videoId.startsWith("local:")) usePlayer.getState().setAutomix(false);
    usePlayer.getState().playTracks(tracks, tracks.indexOf(t), source);
  }
  const title =
    route === "/playlists"
      ? "My Playlists"
      : route === "/local"
        ? "Local Music"
        : route === "/downloads"
          ? "Downloads"
          : route === "/desktop-settings"
            ? "Desktop Settings"
            : route === "/integrations"
              ? "Account Integrations"
              : route === "/favorites"
                ? "Favorites"
                : route === "/history"
                  ? "Playback History"
                  : route === "/lyrics"
                    ? "Lyrics"
                    : "Now Playing";
  return (
    <section className="desktop-page">
      <div className="desktop-eyebrow">YOUR MUSIC. YOUR SPACE.</div>
      <h1>{title}</h1>
      <p className="desktop-subtitle">
        {route === "/local"
          ? "Bring your collection home. MP3, FLAC, WAV, AAC, Ogg and Opus."
          : route === "/downloads"
            ? "Keep music from sources that explicitly permit downloading."
            : "BitChord, made for your desktop."}
      </p>
      {message && (
        <div role="status" className="desktop-message">
          {message}
        </div>
      )}
      {route === "/playlists" && (
        <>
          <div className="desktop-card">
            <h2>Save your queue as a playlist</h2>
            <p>
              Add songs to the queue from Local Music, Search, or your library,
              then save them here. Local playlists stay on this PC.
            </p>
            <input
              aria-label="Playlist name"
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              placeholder="Playlist name"
            />
            <button
              disabled={!playlistTitle.trim() || busy}
              onClick={() =>
                void run(async () => {
                  const tracks = usePlayer.getState().queue.map((e) => e.track);
                  if (!tracks.length)
                    throw Error("Add at least one song to the queue first.");
                  await native.call("savePlaylist", {
                    title: playlistTitle.trim(),
                    tracks,
                  });
                  setPlaylistTitle("");
                  await refresh();
                }, "Playlist saved")
              }
            >
              Save queue
            </button>
          </div>
          {playlists.map((p) => p.sourceUrl?<SpotifyLinkedPlaylist key={p.id} playlist={p} onChange={()=>void refresh()}/>:( 
            <div className="desktop-card" key={p.id}>
              <h2>{p.title}</h2><PlaylistEditor playlist={p} onSaved={()=>void refresh()}/>
              <p>{p.tracks.length} songs · {p.tracks.filter((t:Track)=>t.unavailable).length} unmatched metadata entries</p>
              <button disabled={!p.tracks.some((t:Track)=>!t.unavailable)}
                onClick={() => {
                  if (
                    p.tracks.some((t: Track) => t.videoId.startsWith("local:"))
                  )
                    usePlayer.getState().setAutomix(false);
                  usePlayer
                    .getState()
                    .playTracks(p.tracks.filter((t:Track)=>!t.unavailable), 0, {
                      type: "playlist",
                      title: p.title,
                      id: p.id,
                    });
                }}
              >
                Play matched songs
              </button>
              <button disabled={!p.tracks.some((t:Track)=>!t.unavailable)}
                onClick={() =>
                  usePlayer
                    .getState()
                    .addToQueue(p.tracks.filter((t:Track)=>!t.unavailable), {
                      type: "playlist",
                      title: p.title,
                      id: p.id,
                    })
                }
              >
                Add to queue
              </button>
              <button
                onClick={() =>
                  void run(async () => {
                    await native.call("deletePlaylist", { id: p.id });
                    await refresh();
                  }, "Playlist deleted")
                }
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}
      {["/local", "/favorites", "/history"].includes(route) && (
        <>
          <div className="desktop-toolbar">
            {route === "/local" && (
              <>
                <button
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await native.call("import", { folder: true });
                      await refresh();
                    }, "Folder scanned")
                  }
                >
                  <FolderOpen size={17} /> Add folder
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await native.call("import", { folder: false });
                      await refresh();
                    }, "Files imported")
                  }
                >
                  Add files
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await native.call("rescan");
                      await refresh();
                    }, "Library refreshed")
                  }
                >
                  <RefreshCw size={16} /> Rescan
                </button>
              </>
            )}
            <span>{tracks.length} songs</span>
          </div>
          {!tracks.length ? (
            <div className="desktop-empty">
              <FolderOpen size={40} />
              <h2>
                {route === "/local"
                  ? "Your collection starts here"
                  : "No songs yet"}
              </h2>
              <p>
                {route === "/local"
                  ? "Choose a music folder or drag audio files into BitChord."
                  : "Play music or save a favorite to see it here."}
              </p>
            </div>
          ) : (
            <div className="desktop-tracks">
              {tracks.map((t, i) => (
                <div className="desktop-track" key={t.videoId + ":" + i}>
                  <button
                    aria-label={"Play " + t.title}
                    onClick={() => play(t)}
                  >
                    <Play size={18} />
                  </button>
                  <div>
                    <strong>{t.title}</strong>
                    <small>
                      {t.artists.map((a) => a.name).join(", ")}
                      {t.album ? " · " + t.album.name : ""}
                    </small>
                  </div>
                  <TrackMenu track={t}/>
                  <span className="total-duration">
                    {t.durationSec
                      ? `${Math.floor(t.durationSec / 60)}:${String(Math.floor(t.durationSec % 60)).padStart(2, "0")}`
                      : "—"}
                  </span>
                  <button
                    title="Add to queue"
                    onClick={() => usePlayer.getState().addToQueue([t], source)}
                  >
                    <Plus size={17} />
                  </button>
                  <button
                    title="Toggle favorite"
                    onClick={() =>
                      void run(async () => {
                        await native.call("favorite", { track: t });
                        await refresh();
                      })
                    }
                  >
                    <Heart size={17} />
                  </button>
                  {t.videoId.startsWith("local:") && (
                    <button
                      title="Show in File Explorer"
                      onClick={() =>
                        void run(
                          () => native.call("reveal", { id: t.videoId }),
                          "Opened in File Explorer",
                        )
                      }
                    >
                      <FolderOpen size={17} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {route === "/downloads" && (
        <>
          <div className="desktop-card">
            <h2>Download an audio file</h2>
            <label>
              Direct HTTPS audio URL
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…/song.flac"
              />
            </label>
            <label className="desktop-check">
              <input
                type="checkbox"
                checked={permitted}
                onChange={(e) => setPermitted(e.target.checked)}
              />
              The source permits downloading this file.
            </label>
            <p>
              Original quality is preserved. BitChord does not convert or
              download YouTube or Spotify streams.
            </p>
            <button
              disabled={busy || !url || !permitted}
              onClick={() =>
                void run(async () => {
                  await native.call("download", { url, permitted });
                  await refresh();
                }, "Download started")
              }
            >
              <Download size={17} /> Download
            </button>
            <button
              onClick={() =>
                void run(async () => {
                  await native.call("downloadFolder");
                  await refresh();
                })
              }
            >
              Choose download folder
            </button>
            <small>{settings.downloadFolder}</small>
          </div>
          {jobs.map((j) => (
            <div className="desktop-card" key={j.id}>
              <strong>{j.title}</strong>
              <p>
                {j.status} · {(j.received / 1048576).toFixed(1)} MB
                {j.total ? " / " + (j.total / 1048576).toFixed(1) + " MB" : ""}
              </p>
              <progress value={j.received} max={j.total || undefined} />
              {j.error && <p>{j.error}</p>}
              {j.sha256&&<small>SHA-256: {j.sha256}</small>}
              {['failed','cancelled'].includes(j.status)&&j.url&&<button onClick={()=>void run(async()=>{await native.call('download',{url:j.url,permitted:true});await refresh();},'Retry started')}>Retry download</button>}
              {j.status === "downloading" && (
                <button
                  onClick={() =>
                    void native.call("cancelDownload", { id: j.id })
                  }
                >
                  Cancel
                </button>
              )}
              {j.status === "complete" && (
                <Link to="/local">Play from Local Music</Link>
              )}
            </div>
          ))}
        </>
      )}
      {route === "/desktop-settings" && (
        <>
          <div className="desktop-card">
            <h2>Windows</h2><label>Close Button Behavior<select aria-label="Close Button Behavior" value={settings.minimizeToTray?'tray':'exit'} onChange={e=>void run(async()=>{await native.call('setting',{key:'minimizeToTray',value:e.target.value==='tray'});await refresh();})}><option value="exit">Exit BitChord and stop playback (default)</option><option value="tray">Minimize to system tray and continue playback</option></select></label>
            {[
              ["startup", "Launch at Windows startup"],
            ].map(([k, label]) => (
              <label className="desktop-check" key={k}>
                <input
                  type="checkbox"
                  checked={!!settings[k!]}
                  onChange={(e) =>
                    void run(async () => {
                      await native.call("setting", {
                        key: k,
                        value: e.target.checked,
                      });
                      await refresh();
                    })
                  }
                />
                {label}
              </label>
            ))}
            <label>
              Theme
              <select
                aria-label="Theme"
                defaultValue={
                  localStorage.getItem("bitchord:theme") || "system"
                }
                onChange={(e) => {
                  localStorage.setItem("bitchord:theme", e.target.value);
                  document.documentElement.dataset.theme = e.target.value;
                }}
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>
          <div className="desktop-card">
            <h2>Audio</h2>
            <p>
              Equalizer applies to the active audio deck. AutoMix has its own
              processing; local playback disables AutoMix.
            </p>
            <div className="desktop-eq">
              {frequencies.map((f, i) => (
                <label key={f}>
                  {f < 1000 ? f + " Hz" : f / 1000 + " kHz"}
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={audioSettings.gains[i]}
                    onChange={(e) => {
                      audioSettings.gains[i] = Number(e.target.value);
                      setRevision(revision + 1);
                      void run(saveAudio);
                    }}
                  />
                  <span>{audioSettings.gains[i]} dB</span>
                </label>
              ))}
            </div>
            <label>
              Bass boost
              <input
                type="range"
                min="0"
                max="12"
                value={audioSettings.bass}
                onChange={(e) => {
                  audioSettings.bass = Number(e.target.value);
                  setRevision(revision + 1);
                  void run(saveAudio);
                }}
              />
            </label>
            <label>
              Playback speed
              <select
                defaultValue={audioSettings.speed}
                onChange={(e) => {
                  audioSettings.speed = Number(e.target.value);
                  void run(saveAudio);
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() =>
                void run(async () => {
                  setDevices(
                    (await navigator.mediaDevices.enumerateDevices()).filter(
                      (d) => d.kind === "audiooutput",
                    ),
                  );
                }, "Outputs refreshed")
              }
            >
              Refresh audio outputs
            </button>
            <select
              aria-label="Audio output"
              defaultValue={audioSettings.sink}
              onChange={(e) => {
                audioSettings.sink = e.target.value;
                void run(saveAudio);
              }}
            >
              <option value="">System default</option>
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || "Output " + (i + 1)}
                </option>
              ))}
            </select>
            <label>
              Sleep timer
              <select
                defaultValue="0"
                onChange={(e) => {
                  sleep(Number(e.target.value));
                  setMessage(
                    e.target.value === "0"
                      ? "Sleep timer cancelled"
                      : "Sleep timer set",
                  );
                }}
              >
                {[0, 15, 30, 60, 90].map((n) => (
                  <option key={n} value={n}>
                    {n ? n + " minutes" : "Off"}
                  </option>
                ))}
              </select>
            </label>
            <Link to="/settings">
              Crossfade, AutoMix, artwork and lyric settings →
            </Link>
          </div>
          <div className="desktop-card">
            <h2>Keyboard shortcuts</h2>
            <p>
              Space: play/pause · Ctrl+Left/Right: previous/next · Ctrl+Up/Down:
              volume · media keys: playback · drag audio files anywhere to
              import.
            </p>
          </div>
        </>
      )}
      {route === "/integrations" && (
        <>
          <SpotifyConnection/>
          <GoogleConnection/>
          <YouTubeConnection/>
          <div className="desktop-card">
            <h2>Discord Rich Presence</h2>
            <p>
              Uses the installed Discord app over local RPC. Supply a Discord
              application ID; no user token is required.
            </p>
            <input
              aria-label="Discord client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Discord application ID"
            />
            <button
              disabled={busy}
              onClick={() =>
                void run(
                  () => native.call("discord", { clientId }),
                  "Discord connected",
                )
              }
            >
              Connect
            </button>
          </div>
          <div className="desktop-card">
            <h2>ListenBrainz</h2>
            <button
              onClick={() =>
                void run(
                  () => native.call("disconnect", { service: "listenbrainz" }),
                  "ListenBrainz disconnected",
                )
              }
            >
              Disconnect
            </button>
            <input
              aria-label="ListenBrainz token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="User token"
            />
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await native.call("listenbrainz", { token });
                  setToken("");
                }, "ListenBrainz connected")
              }
            >
              Connect
            </button>
          </div>
          <div className="desktop-card">
            <h2>Last.fm</h2>
            <button
              onClick={() =>
                void run(
                  () => native.call("disconnect", { service: "lastfm" }),
                  "Last.fm disconnected",
                )
              }
            >
              Disconnect
            </button>
            <p>
              Enter your registered Last.fm application credentials, authorize
              in your browser, then complete connection.
            </p>
            <input
              aria-label="Last.fm API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="API key"
            />
            <input
              aria-label="Last.fm API secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="API secret"
            />
            <button
              disabled={busy}
              onClick={() =>
                void run(
                  () => native.call("lastfmStart", { key, secret }),
                  "Authorize BitChord in your browser",
                )
              }
            >
              Authorize
            </button>
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await native.call("lastfmFinish");
                  setKey("");
                  setSecret("");
                }, "Last.fm connected")
              }
            >
              Complete connection
            </button>
          </div>
        </>
      )}
      {["/now-playing", "/lyrics"].includes(route) && <NowPlaying/>}
    </section>
  );
}
