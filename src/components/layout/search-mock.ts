// TODO: replace with GET /api/v1/search when endpoint is available
export type MockSearchHit = {
  type: string;
  title: string;
};

export const MOCK_SEARCH_HITS: MockSearchHit[] = [
  { type: "Memory",  title: "Open Memory center"             },
  { type: "Article", title: "EU AI Act Implementation"        },
  { type: "Session", title: "AI Ethics in Practice"           },
  { type: "Note",    title: "Consequentialism vs Deontology"  },
  { type: "Topic",   title: "Quantum Computing Fundamentals"  },
  { type: "Article", title: "Memory-Augmented LLMs"           },
];
