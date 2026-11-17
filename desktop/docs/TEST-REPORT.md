# Liquid Glass verification

Local production TypeScript/Vite/main/preload compilation passed. Node tests: 12 passed (eight previous security/artwork/range, two appearance persistence/defaults, two PKCE/state). Vitest: 159 passed across 16 suites. Total: 171 passed, zero failures/skips.

Electron smoke checks passed: launch, WAV/MP3/FLAC playback, byte-range response, native IPC pause, local playlist creation, library/favorite/playlist/settings restart persistence.

Appearance tests validate persistence and safe defaults, not visual contrast or language glyph coverage. PKCE tests validate RFC S256 and callback-state matching, not a real Spotify account. No successful real-provider authorization is claimed. Local video mode and download improvements require additional end-to-end validation.

Native Windows automated results and packaging are reported by the linked GitHub Actions run. Native Windows 10/11 manual tests have not run. Use WINDOWS-ACCEPTANCE.md for installation/uninstall, media keys, artwork, lyrics, theme/accessibility and persistence checks.

## Windows build verification

GitHub Actions run https://github.com/Manojpraba27/BitChord-Windows/actions/runs/44153427595 completed successfully on windows-latest. The 171 automated unit/regression tests passed there; both NSIS setup and portable EXEs were generated. Both published EXEs were downloaded and independently checked against the runner SHA-256 manifest: both matched.

Portable SHA-256: ace8af449e435e0e8e729b9eb802c74ebe5f225c20c25e3bb678bd9db52165ac
Setup SHA-256: 1b1b2241e5b58655936c3dac0bb50da8aea2ebf00e42415a0d20f18c85b71e6e

Additional Linux Electron UI smoke checks passed for playlist rename/save and appearance reduced-motion preference. Windows automated results above are unit/regression tests, not Windows UI playback/installer execution tests. Manual Windows 10/11 installation, uninstallation, media keys, high-DPI/language rendering, video codecs and account integration remain unverified.
