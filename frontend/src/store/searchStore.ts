import { create } from 'zustand';

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
  
  // Struggle Detection
  searchCount: number;
  lastSearchTime: number;
  scrollDepth: number;
  isStruggling: boolean;
  setScrollDepth: (depth: number) => void;
  checkStruggle: () => void;
  
  // Help Me Remember
  helpMeRememberActive: boolean;
  setHelpMeRememberActive: (active: boolean) => void;
  activeQuestion: string | null;
  answeredQuestions: Record<string, string>;
  addAnswer: (question: string, answer: string) => void;
  removeAnswer: (question: string) => void;
  
  // Adaptive Question Engine
  questionBank: string[];
  getNextQuestion: () => void;
  
  // Phase 4: Success & Near-Miss
  isSuccess: boolean;
  successStats: { timeSeconds: number; queries: number; answers: number } | null;
  foundPhotoId: string | null;
  setSuccess: (success: boolean, photoId?: string) => void;
  sessionStartTime: number;
  candidatesCount: number;
  setCandidatesCount: (count: number) => void;
  
  // Storage for Favourites and Albums
  favouriteIds: string[];
  toggleFavourite: (id: string) => void;
  albumPhotos: Record<string, string[]>;
  addToAlbum: (albumName: string, id: string) => void;
  
  selectedPhotoId: string | null;
  setSelectedPhotoId: (id: string | null) => void;

  // Phase 5: Ask Photos
  isAskMode: boolean;
  toggleAskMode: () => void;
  askConversation: { id: string; role: 'user' | 'assistant'; type: 'text' | 'chips' | 'results'; content: string; options?: string[] }[];
  addAskMessage: (msg: { role: 'user' | 'assistant'; type: 'text' | 'chips' | 'results'; content: string; options?: string[] }) => void;
  clearAskConversation: () => void;
}

const INITIAL_QUESTION_BANK = [
  "Who was there?",
  "What was in the photo?",
  "Where were you?",
  "Indoors or outdoors?",
  "Daylight or evening?",
  "Special occasion or an ordinary day?"
];

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  setQuery: (query) => {
    set((state) => {
      const now = Date.now();
      const isQuickReformulation = now - state.lastSearchTime < 180000; // 3 mins
      const newSearchCount = isQuickReformulation ? state.searchCount + 1 : 1;
      
      return {
        query,
        lastSearchTime: now,
        sessionStartTime: state.sessionStartTime === 0 ? now : state.sessionStartTime,
        searchCount: newSearchCount,
        isStruggling: state.isStruggling || newSearchCount >= 3,
      };
    });
  },
  
  searchCount: 0,
  lastSearchTime: 0,
  scrollDepth: 0,
  isStruggling: false,
  
  setScrollDepth: (depth) => {
    set({ scrollDepth: depth });
    get().checkStruggle();
  },
  
  checkStruggle: () => {
    const { scrollDepth, searchCount, isStruggling } = get();
    // Struggle condition: scrolling past 60 results or 3 searches in 3 mins
    if (!isStruggling && (scrollDepth > 60 || searchCount >= 3)) {
      set({ isStruggling: true });
    }
  },
  
  helpMeRememberActive: false,
  setHelpMeRememberActive: (active) => set((state) => ({ 
    helpMeRememberActive: active, 
    activeQuestion: INITIAL_QUESTION_BANK[0],
    ...(active ? { query: '' } : {})
  })),
  
  activeQuestion: null,
  answeredQuestions: {},
  questionBank: INITIAL_QUESTION_BANK,
  
  addAnswer: (question, answer) => {
    set((state) => ({
      answeredQuestions: { ...state.answeredQuestions, [question]: answer },
    }));
    get().getNextQuestion();
  },
  
  removeAnswer: (question) => {
    set((state) => {
      const newAnswers = { ...state.answeredQuestions };
      delete newAnswers[question];
      return { answeredQuestions: newAnswers };
    });
    get().getNextQuestion();
  },
  
  getNextQuestion: () => {
    set((state) => {
      const remainingQuestions = state.questionBank.filter(q => !state.answeredQuestions[q]);
      // Simple logic: pick the first remaining question (mocking Shannon entropy for MVP)
      return { activeQuestion: remainingQuestions.length > 0 ? remainingQuestions[0] : null };
    });
  },
  
  isSuccess: false,
  successStats: null,
  foundPhotoId: null,
  setSuccess: (success, photoId) => {
    const state = get();
    const timeTaken = state.sessionStartTime > 0 ? Math.floor((Date.now() - state.sessionStartTime) / 1000) : 0;
    set({ 
      isSuccess: success,
      foundPhotoId: success && photoId ? photoId : null,
      successStats: success ? {
        timeSeconds: timeTaken,
        queries: state.searchCount,
        answers: Object.keys(state.answeredQuestions).length
      } : null
    });
  },
  sessionStartTime: 0,
  candidatesCount: 0,
  setCandidatesCount: (count) => set({ candidatesCount: count }),
  
  favouriteIds: [],
  toggleFavourite: (id) => set((state) => ({
    favouriteIds: state.favouriteIds.includes(id) 
      ? state.favouriteIds.filter(fId => fId !== id)
      : [...state.favouriteIds, id]
  })),
  albumPhotos: {},
  addToAlbum: (albumName, id) => set((state) => ({
    albumPhotos: {
      ...state.albumPhotos,
      [albumName]: [...(state.albumPhotos[albumName] || []), id]
    }
  })),

  selectedPhotoId: null,
  setSelectedPhotoId: (id) => set({ selectedPhotoId: id }),

  isAskMode: false,
  toggleAskMode: () => set((state) => ({ isAskMode: !state.isAskMode })),
  askConversation: [],
  addAskMessage: (msg) => set((state) => ({
    askConversation: [...state.askConversation, { id: Math.random().toString(36).substring(7), ...msg }]
  })),
  clearAskConversation: () => set({ askConversation: [] })
}));
