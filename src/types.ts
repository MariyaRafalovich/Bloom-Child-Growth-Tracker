export type ChildProfile = {
  name: string;
  age: string;
  interests: string;
  temperament: string;
  sheetWebhook?: string;
};

export type LogEntry = {
  id: string;
  date: string;
  input: string;
  analysis: {
    observation: string;
    pattern: string;
    scaffold: string;
    why: string;
    guidance: string;
    resources: string;
    domain: "Social" | "Cognitive" | "Motor" | "Emotional" | "Creative";
  };
};
