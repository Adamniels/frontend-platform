import { delay } from "./delay";

export type UserSettings = {
  theme: "system" | "light" | "dark";
  digestEmail: boolean;
};

export async function fetchUserSettings(): Promise<UserSettings> {
  await delay(80);
  return { theme: "system", digestEmail: true };
}
