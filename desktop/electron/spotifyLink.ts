export function spotifyPlaylistId(value: string) {
  const input = value.trim();
  const uri = /^spotify:playlist:([A-Za-z0-9]{22})$/.exec(input);
  if (uri) return uri[1]!;
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    throw Error(
      "Paste a full Spotify playlist link, for example https://open.spotify.com/playlist/…",
    );
  }
  if (
    u.protocol !== "https:" ||
    u.hostname !== "open.spotify.com" ||
    u.port ||
    u.username ||
    u.password
  )
    throw Error(
      "Use a full https://open.spotify.com/playlist/… link. Short links and other hosts are not imported.",
    );
  const p = /^\/(?:intl-[a-z]{2}\/)?playlist\/([A-Za-z0-9]{22})\/?$/.exec(
    u.pathname,
  );
  if (!p)
    throw Error(
      "This is not a Spotify playlist link. Album, track and account links are not supported.",
    );
  return p[1]!;
}
export async function readSpotifyPlaylistLink(
  value: string,
  provider: {
    playlistInfo: (id: string) => Promise<any>;
    tracks: (id: string, offset: number) => Promise<any>;
  },
) {
  const id = spotifyPlaylistId(value);
  const info = await provider.playlistInfo(id);
  const tracks: any[] = [];
  let offset = 0,
    skipped = 0;
  for (let page = 0; page < 201; page++) {
    const p = await provider.tracks(id, offset);
    if (
      !Array.isArray(p.items) ||
      !Number.isInteger(p.raw) ||
      p.raw < 0 ||
      !Number.isFinite(p.total)
    )
      throw Error("Spotify returned an invalid playlist page. Retry.");
    if (offset + p.raw > 10000)
      throw Error("This playlist exceeds the 10,000-entry import limit.");
    tracks.push(...p.items);
    skipped += Math.max(0, p.raw - p.items.length);
    offset += p.raw;
    if (p.raw === 0 || offset >= p.total)
      return {
        name: info.name || "Spotify playlist",
        tracks,
        skipped,
        url: "https://open.spotify.com/playlist/" + id,
      };
  }
  throw Error(
    "Spotify pagination did not finish. Retry or import an export file.",
  );
}

export async function readSpotifyPublicLink(
  value: string,
  fetcher: typeof fetch = globalThis.fetch,
) {
  const id = spotifyPlaylistId(value);
  const url = "https://open.spotify.com/playlist/" + id;
  let response: Response;
  try {
    response = await fetcher(
      "https://open.spotify.com/oembed?" + new URLSearchParams({ url }),
      {
        redirect: "error",
        signal: AbortSignal.timeout(15000),
        credentials: "omit",
      },
    );
  } catch {
    throw Error(
      "Spotify public playlist preview could not load. Check your connection and retry.",
    );
  }
  if (!response.ok)
    throw Error(
      `Spotify could not provide this public playlist (HTTP ${response.status}). Private/restricted links may require account access or an export file.`,
    );
  let j: any;
  try {
    j = await response.json();
  } catch {
    throw Error("Spotify returned an unreadable playlist preview.");
  }
  if (
    j.provider_name !== "Spotify" ||
    typeof j.title !== "string" ||
    !j.title.trim()
  )
    throw Error("Spotify did not return valid playlist metadata.");
  return {
    id: "spotify-link:" + id,
    title: j.title.trim().slice(0, 500),
    sourceUrl: url,
    embedUrl: "https://open.spotify.com/embed/playlist/" + id,
  };
}
