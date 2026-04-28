// NOTE: GET /api/v1/saved-items exists — wire SavedItemsExperience to the real API
// and delete this file once that is done.
// TODO: remove once SavedItemsExperience uses real API data
export type MockSavedItem = {
  id: number;
  type: string;
  title: string;
  date: string;
  tags: string[];
};

export const MOCK_SAVED_ITEM_TYPES = ["All", "Article", "Session", "Note", "Topic", "Resource"] as const;

export const MOCK_SAVED_ITEMS: MockSavedItem[] = [
  { id: 1, type: "Article",  title: "EU AI Act Implementation: What Changes in Q3 2026",   date: "Apr 23", tags: ["Policy"]      },
  { id: 2, type: "Session",  title: "The Alignment Problem — Learning Session",              date: "Apr 15", tags: ["AI", "Ethics"] },
  { id: 3, type: "Note",     title: "Key frameworks: Consequentialism vs Deontology",        date: "Apr 18", tags: ["Philosophy"]   },
  { id: 4, type: "Topic",    title: "Quantum Computing Fundamentals",                        date: "Apr 20", tags: ["Quantum"]      },
  { id: 5, type: "Resource", title: "Russell: Human Compatible (Annotations)",               date: "Apr 12", tags: ["Books"]        },
];
