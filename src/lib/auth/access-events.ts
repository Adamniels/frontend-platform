export const ACCESS_UNAUTHORIZED_EVENT = "platform:access-unauthorized";

export function emitUnauthorizedAccess(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ACCESS_UNAUTHORIZED_EVENT));
}

