export function closeAction(
  behavior: unknown,
  trayAvailable: boolean,
  quitting: boolean,
) {
  return !quitting && behavior === "tray" && trayAvailable ? "hide" : "exit";
}
