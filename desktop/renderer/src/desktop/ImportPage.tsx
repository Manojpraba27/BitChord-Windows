import { useState } from "react";
import { Link } from "react-router";
import { native } from "./api";
export default function ImportPage() {
  const [match,setMatch]=useState(true),[preview, setPreview] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [undo, setUndo] = useState("");
  async function run(job: () => Promise<any>) {
    setBusy(true);
    setMessage("");
    try {
      return await job();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="desktop-page"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void run(async () =>
          setPreview(
            await native.importPlaylistDropped(
              Array.from(e.dataTransfer.files),match,
            ),
          ),
        );
      }}
    >
      <div className="desktop-eyebrow">YOUR COLLECTION, TOGETHER</div>
      <h1>Import Library</h1>
      <p className="desktop-subtitle">
        Bring playlist metadata and your own music into BitChord. No Spotify
        developer account required.
      </p>
      <div className="desktop-card">
        <h2>Spotify & playlist exports</h2>
        <p>
          Choose or drop CSV, JSON, M3U or M3U8. Spotify account-data playlist
          JSON, common playlist CSV exports, and JSON track arrays are
          supported. Google/YouTube CSV exports with a Title column can be
          imported as unmatched metadata.
        </p>
        <p>
          Importing does not download Spotify or YouTube songs. Exact, unique
          title/artist matches use your existing local audio library. M3U file
          paths are not followed automatically; add those music files through
          Local Music first. Playlist URLs require an authorized provider API
          and are not scraped.
        </p>
        <button
          disabled={busy}
          onClick={() =>
            void run(async () => setPreview(await native.call("importPreview",{match})))
          }
        >
          Choose CSV / JSON / M3U
        </button>
        <Link to="/local">Import Local Music →</Link>
        {busy && <p role="status">Reading and matching import…</p>}
        <label>
          Match existing local library{" "}
          <input type="checkbox" checked={match} onChange={e=>{setMatch(e.target.checked);setPreview(null);}} /> Exact title and artist;
          ambiguous matches remain unmatched
        </label>
      </div>
      {message && (
        <div role="status" className="desktop-message">
          {message}
        </div>
      )}
      {preview && (
        <div className="desktop-card">
          <h2>Preview · {preview.file}</h2>
          {preview.lists.map((p: any) => (
            <div key={p.id}>
              <h3>
                {p.title}{" "}
                {p.exists && <small>Already imported — will skip</small>}
              </h3>
              <p>
                {p.tracks.length} tracks · {p.matched} matched locally ·{" "}
                {p.tracks.length - p.matched} unmatched · {p.duplicates}{" "}
                duplicate rows removed
              </p>
              {p.tracks.slice(0, 50).map((t: any, i: number) => (
                <div className="import-preview-row" key={i}>
                  <span>
                    {i + 1}. {t.title}
                    <small>
                      {" "}
                      · {t.artists.map((a: any) => a.name).join(", ")}
                      {t.album ? " · " + t.album.name : ""}
                    </small>
                  </span>
                  <strong className="import-tag">
                    {t.unavailable
                      ? "Unmatched metadata"
                      : "Playable local audio"}
                  </strong>
                </div>
              ))}
              {p.tracks.length > 50 && (
                <p>
                  Showing the first 50 entries; all {p.tracks.length} entries
                  will be imported.
                </p>
              )}
            </div>
          ))}
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const r = await native.call("importApply", {
                  token: preview.token,
                });
                setUndo(r.undoId);
                setPreview(null);
                setMessage(
                  `${r.added} playlists imported; ${r.duplicates} existing playlists skipped.`,
                );
              })
            }
          >
            Import playlists
          </button>
          <button onClick={() => setPreview(null)}>Cancel preview</button>
        </div>
      )}
      {undo && (
        <div className="desktop-card">
          <p>
            Undo removes only the playlists added by this import, including
            subsequent edits to those playlists.
          </p>
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await native.call("importUndo", { id: undo });
                setUndo("");
                setMessage("Import undone. Existing playlists were preserved.");
              })
            }
          >
            Undo last import
          </button>
          <Link to="/playlists">Open My Playlists →</Link>
        </div>
      )}
    </section>
  );
}
