import type { Bridge, DetectedExtension } from "@bitchord/shared/bridge";
declare global {
  interface Window {
    desktop: {
      call: (method: string, params?: any) => Promise<any>;
      bridge: (method: string, params: any) => Promise<any>;
      importPlaylistDropped:(files:File[],match?:boolean)=>Promise<any>;
      importDropped: (files: File[]) => Promise<any>;
      on: (name: string, fn: (data: any) => void) => () => void;
    };
  }
}
export const native = window.desktop;
export async function detectDesktop(): Promise<DetectedExtension> {
  const bridge: Bridge = {
    transport: "external",
    call: (method, params) => native.bridge(method, params),
    subscribe: (listener) => native.on("bridge-event", listener),
  };
  return { bridge, info: await bridge.call("ping", {}) };
}
