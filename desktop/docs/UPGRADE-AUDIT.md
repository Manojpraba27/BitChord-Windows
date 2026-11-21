# Existing application audit and upgrade plan

## Evidence and architecture

The editable project is `/workspace/work/BitChord/desktop`; the Android app (`app/`), shared sources and original web project remain present. No newly uploaded `BitChord-Setup.zip` is accessible in this task. Five Android screenshots were supplied in chat (Accounts, Library, player, Appearance, song menu); no Home reference has been supplied. The installer examined is the prior workspace deliverable `deliverables/BitChord-Setup.exe`, not an assumed unseen attachment.

Static `file` and 7-Zip inspection identified an NSIS Unicode installer with an embedded `app-64.7z`. Its contents include `BitChord.exe`, Chromium locale/runtime files, `resources/app.asar`, unpacked native Discord protocol modules, Electron/Chromium license notices, and an uninstaller. It was extracted for inspection, not executed. The outer NSIS stub is PE32; the enclosed application is the x64 Electron build.

The ASAR package identifies `bitchord-desktop` version 1.0.0, Electron main entry `dist-electron/main.cjs`, bundled preload, React frontend assets, original icon, third-party notices and licenses. A square 512×512 Android app icon is reused for Windows/tray; the old wordmark is preserved. Two source maps belong to dependency packages (`content-type` and `media-typer`), not the application's frontend. This is recoverable compiled JavaScript/assets, not a complete editable TypeScript project. Source recovery is unnecessary because the full maintained source is available.

Existing stack: Electron 45, React, TypeScript, Vite, Tailwind, Node SQLite, Chromium media/Web Audio and preserved upstream playback/lyrics modules. Credentials use Electron safeStorage with plaintext-backend rejection. Main/preload IPC validates sender/frame and bounds inputs. Native features include tray, media shortcuts, file picker/drop, window controls/bounds, startup preference, notifications and taskbar progress.

Upstream `https://github.com/kushagrasinghx/BitChord` is already cloned as remote `origin`; it was fetched read-only. Current upstream main is `21356206` (v1.9.2 merge). The desktop branch was based on an earlier upstream snapshot and contains intentional desktop adaptations. New upstream changes have not been blindly merged into the preserved Android/web source. Publication destination remains the previously authorized `Manojpraba27/BitChord-Windows` repository.

## Preserve / modify / unavailable

| Area | Decision |
| --- | --- |
| Existing playback, queue, lyrics, search, local scanning, SQLite and Electron security | Preserve and regression test |
| Android, original web, shared modules, branding and attribution | Preserve; this update changes desktop files and its build workflow only |
| Sidebar / Library / Appearance / track menu | Upgrade existing React components, not a replacement application |
| Installer | Separate version 1.1.0, updated filenames and a new preview release; previous installer remains intact |
| YouTube Music account library/profile/Premium stream access | No supported full account integration available here. Keep honest browser-only status; no cookie extraction or fake connection |
| Spotify | Official PKCE requires configured Client ID and authorized account. Official public playlist links work without developer credentials; saving a link is distinct from full track-record import |
| Native mobile glass shader, Android Auto/Wear/widgets | Cannot transfer directly to Electron. CSS blur/reflections are a desktop approximation, not the original refractive Android shader |
| Protected downloads, conversion, unsupported cache deletion | Disabled/explained rather than simulated |

## Progress checklist

- [x] Locate and prioritize editable source.
- [x] Statically inspect existing installer and ASAR without launching it.
- [x] Fetch and compare upstream architecture.
- [x] Review five supplied visual references.
- [x] Add real local listening statistics and Library cards/tiles.
- [x] Add persistent collapsible sidebar and Radio page reusing the existing recommendation queue.
- [x] Expand appearance controls: font, glass/performance, progressive title blur, artwork blending, cover layouts and duration display.
- [x] Expand track menu with native/local actions and explicit unsupported states.
- [ ] Complete visual and device acceptance on Windows 10 and Windows 11.
- [ ] Certify live authorized Spotify login/import and online YouTube/Spotify provider playback.
- [ ] Obtain missing installer ZIP and sixth/Home screenshot for exact comparison.

## Implementation sequence

1. Preserve architecture and baseline artifacts; inspect existing code/installer.
2. Adapt the five references to desktop without copying account identity or example statistics.
3. Validate actual listening/persistence, sidebar, settings and track actions using generated test media.
4. Run the full suite and existing audio/video/import shutdown checks.
5. Build separately named x64 NSIS/portable artifacts on a Windows runner, verify SHA-256 and publish source/docs.
6. Record unverified provider/device/manual checks explicitly.
