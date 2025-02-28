export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: {
    id: string;
    username: string;
  } | null;
}

export interface Question {
  _id: string;
  round: number;
  questionNumber: number;
  content: string;
  answer: string;
  hints: string[];
  points?: number;
  media?: {
    image?: {
      url: string;
      fileName: string;
    };
    pdf?: {
      url: string;
      fileName: string;
    };
  };
}

export interface NewQuestion {
  round: number;
  questionNumber: string | number;
  content: string;
  answer: string;
  hints: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
