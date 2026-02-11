export interface ConventionQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
  options: ConventionOption[];
  applicableTo: string[];
  isRequired: boolean;
}

export interface ConventionOption {
  id: string;
  label: string;
  description: string;
  isRecommended: boolean;
  generatedText: string;
}
