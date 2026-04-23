import { delay } from "./delay";

export type InputNeededItem = {
  id: number;
  text: string;
  type: string;
  urgent: boolean;
  detail: string;
};

export async function fetchInputNeededItems(): Promise<InputNeededItem[]> {
  await delay(80);
  return [
    {
      id: 1,
      text: "Rate your last AI Ethics session",
      type: "Rating",
      urgent: true,
      detail:
        "How would you rate the difficulty and quality of your last session? This helps calibrate future recommendations.",
    },
    {
      id: 2,
      text: "Confirm new interest: Quantum Computing?",
      type: "Confirm",
      urgent: false,
      detail:
        "Detected reading patterns suggesting interest in Quantum Computing. Add it to your interest profile?",
    },
    {
      id: 3,
      text: "Choose your next learning topic",
      type: "Choose",
      urgent: false,
      detail: "You have completed your current track. Select a new area to explore from your recommended topics.",
    },
  ];
}
