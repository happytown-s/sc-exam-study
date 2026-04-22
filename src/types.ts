export interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface CalcQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  cheatsheet: string;
}

export interface SubjectBQuestion {
  id: number;
  category: string;
  scenario: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
