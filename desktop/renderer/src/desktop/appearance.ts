export const defaults = {
  theme: "glass-dark",
  font: "system",
  glass: true,
  performanceGlass: false,
  progressiveBlur: true,
  blend: true,
  fullCover: false,
  fullDetailCover: false,
  showDuration: true,
  sidebarCollapsed: false,
  transparency: 82,
  blur: 20,
  dynamic: true,
  motion: 1,
  reducedMotion: false,
  reducedTransparency: false,
  lyricsOpacity: 90,
  lyricsSize: 30,
  lyricsTheme: "dark",
  solidLyrics: false,
  accent: "#bc9bff",
};
export function loadAppearance() {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("bitchord:appearance") || "{}"),
    };
  } catch {
    return { ...defaults };
  }
}
export function applyAppearance(p = loadAppearance()) {
  const r = document.documentElement;
  r.dataset.theme =
    p.theme === "system"
      ? "system"
      : p.theme.endsWith("light")
        ? "light"
        : "dark";
  r.dataset.glass = String(p.glass && (p.theme.startsWith("glass") || p.theme === "system"));
  r.dataset.reduceMotion = String(p.reducedMotion);
  r.dataset.reduceTransparency = String(p.reducedTransparency);
  r.dataset.performanceGlass = String(p.performanceGlass);
  r.dataset.progressiveBlur = String(p.progressiveBlur);
  r.dataset.blend = String(p.blend);
  r.dataset.fullDetailCover = String(p.fullDetailCover);
  r.dataset.fullCover = String(p.fullCover);
  r.dataset.showDuration = String(p.showDuration);
  r.dataset.sidebarCollapsed = String(p.sidebarCollapsed);
  r.style.setProperty('--desktop-font', p.font === 'serif' ? 'Georgia, serif' : p.font === 'rounded' ? '"Trebuchet MS", "Segoe UI", sans-serif' : '"Segoe UI", "Nirmala UI", system-ui, sans-serif');
  r.dataset.lyricsTheme = p.lyricsTheme;
  r.dataset.solidLyrics = String(p.solidLyrics);
  r.style.setProperty("--glass-opacity", String(p.transparency / 100));
  r.style.setProperty("--glass-blur", p.blur + "px");
  r.style.setProperty(
    "--lyrics-opacity",
    String(Math.max(0.8, p.lyricsOpacity / 100)),
  );
  r.style.setProperty("--bitchord-lyric-size", p.lyricsSize + "px");
  r.style.setProperty("--desktop-accent", p.accent);
  r.style.setProperty("--animation-speed", p.motion ? "220ms" : "0ms");
  if (!p.dynamic) r.style.removeProperty("--ambient-color");
}
export function saveAppearance(p: ReturnType<typeof loadAppearance>) {
  localStorage.setItem("bitchord:appearance", JSON.stringify(p));
  applyAppearance(p);
  window.dispatchEvent(new Event("appearance-changed"));
}
