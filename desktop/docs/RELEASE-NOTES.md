# BitChord Windows release candidate

Preserves the original Android source and reuses the original React player. Adds Electron IPC, Windows integration code, SQLite persistence, local playback, playlists, downloads and desktop settings.

Portable executable: available, unsigned. Source archive: available. Installer: blocked; no valid BitChord-Setup.exe is supplied.

Not ready for a general production release: live integrations and native Windows tests remain outstanding; consult FEATURE-PARITY.md and TEST-REPORT.md.

To unblock: authenticate GitHub CLI with repository write/Actions access, push this local desktop directory and .github/workflows/desktop-windows.yml to a repository you control, then run the workflow 'Build BitChord for Windows'. Download its BitChord-Windows-x64 artifact. Alternatively run npm ci, node node_modules/electron/install.js, npm run dist:win from desktop on Windows with Node 24. Test installation/uninstallation on Windows 10 and 11 before publishing.

Direct attachments cannot currently be exposed from this workspace. No GitHub artifact or release URL exists for these local changes. All available files are under /workspace/work/deliverables/.
