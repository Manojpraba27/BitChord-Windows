import { contextBridge, ipcRenderer, webUtils } from "electron";
const invoke = (method: string, params: any = {}) =>
  ipcRenderer.invoke("desktop", method, params);
contextBridge.exposeInMainWorld("desktop", {
  call: invoke,
  bridge: (method: string, params: any) =>
    ipcRenderer.invoke("bridge", method, params),
  importDropped: (files: File[]) =>
    invoke("importDropped", {
      paths: files.map((f) => webUtils.getPathForFile(f)),
    }),
  on: (name: string, fn: (data: any) => void) => {
    if (!["media", "download", "bridge-event"].includes(name))
      throw Error("Unknown event");
    const cb = (_e: any, data: any) => fn(data);
    ipcRenderer.on(name, cb);
    return () => ipcRenderer.removeListener(name, cb);
  },
});
