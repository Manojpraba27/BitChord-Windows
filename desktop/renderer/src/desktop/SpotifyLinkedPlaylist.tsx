import { useState } from "react";
import { native } from "./api";
import { usePlayer } from "@/state/player";
import { PlaylistEditor } from "./PlaylistEditor";
export function SpotifyLinkedPlaylist({
  playlist,
  onChange,
}: {
  playlist: any;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const id = /^spotify-link:([A-Za-z0-9]{22})$/.exec(playlist.id)?.[1];
  return (
    <div className="desktop-card">
      <h2>{playlist.title}</h2>
      <p>
        Linked Spotify playlist · displayed by Spotify’s official player. No
        songs have been downloaded or imported as local audio.
      </p>
      <button
        disabled={!id}
        onClick={() => {
          const s = usePlayer.getState();
          if (!open && s.status === "playing") s.togglePlay();
          setOpen(!open);
        }}
      >
        {open ? "Hide Spotify player" : "Open Spotify player"}
      </button>
      <a href={playlist.sourceUrl} target="_blank" rel="noreferrer">
        Open on Spotify
      </a>
      <PlaylistEditor playlist={playlist} onSaved={onChange} />
      <button
        onClick={async () => {
          try {
            await native.call("deletePlaylist", { id: playlist.id });
            onChange();
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        Remove saved link
      </button>
      {open && id && (
        <iframe
          title={"Spotify playlist " + playlist.title}
          src={"https://open.spotify.com/embed/playlist/" + id}
          width="100%"
          height="352"
          style={{ border: 0, borderRadius: 14 }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
        />
      )}
      <p>
        Use Spotify’s player controls. Availability, previews, sign-in and
        playback restrictions are determined by Spotify; BitChord’s main
        transport does not control this embed.
      </p>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
