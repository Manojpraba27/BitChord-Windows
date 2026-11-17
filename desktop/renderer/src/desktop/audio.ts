import { desktopAudioElements, ensureAutomix, usePlayer } from "@/state/player";
import type { AutomixGraph } from "@/playback/automix";
export const frequencies = [60, 170, 350, 1000, 3500, 10000];
const defaults = { gains: [0, 0, 0, 0, 0, 0], bass: 0, speed: 1, sink: "" };
export const audioSettings = (() => {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("bitchord:desktop-audio") || "{}"),
    };
  } catch {
    return defaults;
  }
})();
let processing: {
  graph: AutomixGraph;
  bands: BiquadFilterNode[];
  bass: BiquadFilterNode;
} | null = null;
export async function applyAudio() {
  const graph = await ensureAutomix();
  if (!graph) return;
  if (!processing) {
    const ctx = graph.ctx;
    const bands = frequencies.map((f) => {
      const n = ctx.createBiquadFilter();
      n.type = "peaking";
      n.frequency.value = f;
      n.Q.value = 1;
      return n;
    });
    const bass = ctx.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 100;
    graph.master.disconnect();
    graph.master.connect(bass);
    let node: AudioNode = bass;
    for (const band of bands) {
      node.connect(band);
      node = band;
    }
    node.connect(ctx.destination);
    processing = { graph, bands, bass };
  }
  processing.bands.forEach((b, i) =>
    b.gain.setTargetAtTime(audioSettings.gains[i], graph.ctx.currentTime, 0.02),
  );
  processing.bass.gain.setTargetAtTime(
    audioSettings.bass,
    graph.ctx.currentTime,
    0.02,
  );
  if (!usePlayer.getState().automix)
    desktopAudioElements().forEach(
      (a) => (a.playbackRate = audioSettings.speed),
    );
  const ctx = graph.ctx as AudioContext & {
    setSinkId?: (id: string) => Promise<void>;
  };
  if (ctx.setSinkId) await ctx.setSinkId(audioSettings.sink || "");
  if (graph.ctx.state === "suspended") await graph.ctx.resume();
}
export function saveAudio() {
  localStorage.setItem("bitchord:desktop-audio", JSON.stringify(audioSettings));
  return applyAudio();
}
let sleepTimer: ReturnType<typeof setTimeout> | undefined;
export function sleep(minutes: number) {
  clearTimeout(sleepTimer);
  if (minutes > 0)
    sleepTimer = setTimeout(() => {
      if (usePlayer.getState().status === "playing")
        usePlayer.getState().togglePlay();
    }, minutes * 60000);
}
