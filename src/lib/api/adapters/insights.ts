import { delay } from "./delay";

export type MemoryInsight = {
  id: number;
  label: string;
  content: string;
  strength: number;
  confirmed: boolean;
};

export async function fetchInsights(): Promise<MemoryInsight[]> {
  await delay(80);
  return [
    {
      id: 1,
      label: "Recurring Interest",
      content:
        "You consistently engage with AI governance and regulation content over the past 6 weeks.",
      strength: 94,
      confirmed: true,
    },
    {
      id: 2,
      label: "Learning Pattern",
      content: "You prefer structured sessions under 60 minutes, with hands-on exercises.",
      strength: 87,
      confirmed: true,
    },
    {
      id: 3,
      label: "Emerging Trend",
      content: "Your reading behavior suggests growing interest in hardware-level AI acceleration.",
      strength: 61,
      confirmed: false,
    },
    {
      id: 4,
      label: "Knowledge Gap",
      content: "Foundational probability and statistics appear underrepresented in your learning history.",
      strength: 78,
      confirmed: false,
    },
    {
      id: 5,
      label: "Recommended Path",
      content: "Based on your interests, a learning path toward AI Safety Research would match your profile well.",
      strength: 82,
      confirmed: false,
    },
  ];
}
