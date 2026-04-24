import { apiRequest } from "@/lib/api/client";

type UnlockResponse = {
  ok: boolean;
};

type SessionResponse = {
  authenticated: boolean;
};

export async function getAccessSession(): Promise<boolean> {
  const session = await apiRequest<SessionResponse>("/api/admin/session");
  return session.authenticated;
}

export async function unlockWithAccessKey(accessKey: string): Promise<boolean> {
  const response = await apiRequest<UnlockResponse>("/api/admin/unlock", {
    method: "POST",
    body: { accessKey },
  });
  return response.ok;
}

export async function lockAccessSession(): Promise<void> {
  await apiRequest<void>("/api/admin/lock", {
    method: "POST",
  });
}

