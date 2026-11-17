# Liquid Glass desktop update

The existing desktop renderer now includes default Liquid Glass Dark, glass/classic light and dark modes, system appearance, opacity/blur/accent controls, reduced motion/transparency settings, and saved lyrics font size, opacity and solid/light/dark background choices.

Lyrics have a separate contrast-protected panel and multilingual font fallbacks. Existing synchronized scrolling and manual interactions are retained. Font availability depends on installed Windows language fonts.

Spotify uses official Authorization Code with PKCE, system-browser login, state validation, loopback redirect, encrypted tokens, refresh and logout. You must register a Spotify client ID and http://127.0.0.1:43821/callback. API access/development-account restrictions apply. Real-account authorization remains unverified.

Google embedded sign-in is removed from the desktop connection action because it can fail or be blocked. A useful limitation error replaces the blank window. Official YouTube Music account/library OAuth and transferable system-browser cookies are not available here; use the provider website for account listening. No Google passwords are collected.

Audio/Video controls support compatible local MP4/WebM playback. Existing provider playback remains inherited and unverified; no new protected-media download or extraction feature was added.

Direct authorized HTTPS downloads include progress/cancel, destination selection, duplicate checks, retry, byte-count validation and SHA-256 recording. Pause/resume and remote-source per-song actions are not implemented. YouTube/Spotify downloads remain unavailable.

Native Windows 10/11 manual acceptance and provider integration tests remain outstanding. This is a preview, not a full-parity production certification.

## Download status

Windows x64 setup and portable EXEs are built, published and checksum verified. Both are unsigned preview builds. Download assets at https://github.com/Manojpraba27/BitChord-Windows/releases/tag/liquid-glass-preview . Build run: https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44153427595 .
