// Mock UI data until SideLearningExperience is wired to /api/v1/side-learning/sessions (Phase 5).
export type MockTopic = {
  id: number;
  title: string;
  difficulty: string;
  time: string;
  progress: number;
  tags: string[];
};

export const MOCK_TOPICS: MockTopic[] = [
  { id: 1, title: "AI Ethics in Practice",          difficulty: "Intermediate", time: "45 min", progress: 82, tags: ["Ethics", "AI"]          },
  { id: 2, title: "Quantum Computing Fundamentals",  difficulty: "Beginner",     time: "30 min", progress: 0,  tags: ["Quantum", "Physics"]      },
  { id: 3, title: "Agentic System Design",           difficulty: "Advanced",     time: "60 min", progress: 0,  tags: ["Agents", "Architecture"]  },
  { id: 4, title: "Transformer Architecture Deep Dive", difficulty: "Advanced",  time: "90 min", progress: 15, tags: ["ML", "Transformers"]      },
];

export type MockSection = {
  id: string;
  label: string;
  content: string;
};

export const MOCK_SECTIONS: MockSection[] = [
  { id: "goal",       label: "Objective",        content: "Understand key frameworks for evaluating ethical decisions in AI deployment, and apply them to real-world cases." },
  { id: "context",    label: "Context",           content: "AI Ethics draws from moral philosophy, law, social science and computer science."                               },
  { id: "material",   label: "Learning Material", content: "The three dominant frameworks: Consequentialism, Deontology, and Virtue Ethics."                               },
  { id: "resources",  label: "Resources",         content: "Bostrom: Superintelligence · Russell: Human Compatible · EU AI Act (Annex III)"                               },
  { id: "exercise",   label: "Exercise",          content: "Write one paragraph justifying either deployment or delay for an LLM hiring assistant scenario."               },
  { id: "reflection", label: "Reflection",        content: "Rate the difficulty of this session and identify which framework felt most natural."                           },
];

export type MockHistoryEntry = {
  title: string;
  date: string;
  score: string;
};

// TODO: replace with completed sessions from side-learning history endpoint
export const MOCK_HISTORY: MockHistoryEntry[] = [
  { title: "Introduction to LLMs", date: "Apr 20", score: "94%" },
  { title: "Bias in Machine Learning", date: "Apr 18", score: "88%" },
  { title: "The Alignment Problem", date: "Apr 15", score: "91%" },
];
