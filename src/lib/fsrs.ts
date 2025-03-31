// Implementação da lógica principal do algoritmo FSRS (Free Spaced Repetition Scheduler)
import { defaultParameters, initialIntervals } from "./fsrs-parameters";
import { addDays, differenceInDays } from "date-fns";

// Tipos para o algoritmo FSRS
export type Rating = 1 | 2 | 3 | 4; // 1: Esqueci, 2: Difícil, 3: Bom, 4: Fácil
export type State = 0 | 1 | 2 | 3; // 0: novo, 1: aprendendo, 2: revisão, 3: reaprendendo

// Interface para o estado de um flashcard no FSRS
export interface FlashcardState {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: State;
  due: Date;
}

// Interface para o resultado de uma revisão
export interface ReviewResult {
  card: FlashcardState;
  scheduled_days: number;
  next_due: Date;
}

// Classe para gerenciar o algoritmo FSRS
export class FSRSManager {
  private requestRetention: number;
  private maximumInterval: number;
  
  constructor() {
    this.requestRetention = defaultParameters.request_retention;
    this.maximumInterval = defaultParameters.maximum_interval;
  }
  
  // Cria um novo estado para um flashcard
  createNewState(): FlashcardState {
    const now = new Date();
    
    return {
      stability: 0,
      difficulty: 0.3, // Dificuldade inicial média
      elapsed_days: 0,
      scheduled_days: 0,
      reps: 0,
      lapses: 0,
      state: 0, // novo
      due: now
    };
  }
  
  // Processa uma revisão e retorna o novo estado
  review(state: FlashcardState, rating: Rating): ReviewResult {
    const now = new Date();
    
    // Se for um cartão novo, use os intervalos iniciais
    if (state.state === 0) {
      const initialInterval = initialIntervals[rating];
      const nextDue = addDays(now, initialInterval);
      
      // Cria um novo estado baseado no rating
      const newState: FlashcardState = {
        ...state,
        stability: rating >= 3 ? rating : 0, // Estabilidade inicial baseada no rating
        difficulty: this.calculateInitialDifficulty(rating),
        elapsed_days: 0,
        scheduled_days: initialInterval,
        reps: state.reps + 1,
        lapses: rating === 1 ? state.lapses + 1 : state.lapses,
        state: rating === 1 ? 1 : 2, // Se esqueceu, vai para aprendendo, senão para revisão
        due: nextDue
      };
      
      return {
        card: newState,
        scheduled_days: initialInterval,
        next_due: nextDue
      };
    }
    
    // Para cartões já revisados, use nossa implementação simplificada do FSRS
    const elapsedDays = differenceInDays(now, state.due) || 0;
    
    // Calcular nova estabilidade baseada no rating
    let newStability = state.stability;
    let newState = state.state;
    
    if (rating === 1) { // Esqueci
      // Reduz a estabilidade e muda para estado de reaprendizado
      newStability = Math.max(1, state.stability * 0.5);
      newState = 3; // reaprendendo
    } else {
      // Aumenta a estabilidade baseado no rating
      const stabilityFactor = {
        2: 1.2, // Difícil
        3: 1.5, // Bom
        4: 2.0  // Fácil
      }[rating];
      
      newStability = state.stability * stabilityFactor;
      newState = 2; // revisão
    }
    
    // Calcular nova dificuldade baseada no rating
    let newDifficulty = state.difficulty;
    if (rating === 1) {
      newDifficulty = Math.min(1, state.difficulty + 0.1);
    } else if (rating === 4) {
      newDifficulty = Math.max(0, state.difficulty - 0.1);
    }
    
    // Calcular próximo intervalo baseado na nova estabilidade
    // Fórmula simplificada do FSRS
    const interval = Math.round(newStability * (rating === 4 ? 1.3 : 1.0));
    const cappedInterval = Math.min(interval, this.maximumInterval);
    const nextDue = addDays(now, cappedInterval);
    
    // Criar novo estado
    const newFlashcardState: FlashcardState = {
      ...state,
      stability: newStability,
      difficulty: newDifficulty,
      elapsed_days: elapsedDays,
      scheduled_days: cappedInterval,
      reps: state.reps + 1,
      lapses: rating === 1 ? state.lapses + 1 : state.lapses,
      state: newState,
      due: nextDue
    };
    
    return {
      card: newFlashcardState,
      scheduled_days: cappedInterval,
      next_due: nextDue
    };
  }
  
  // Calcula a dificuldade inicial baseada no rating
  private calculateInitialDifficulty(rating: Rating): number {
    // Valores entre 0 e 1, onde 0 é mais fácil e 1 é mais difícil
    switch (rating) {
      case 1: return 0.8; // Esqueci - difícil
      case 2: return 0.6; // Difícil - moderadamente difícil
      case 3: return 0.4; // Bom - moderadamente fácil
      case 4: return 0.2; // Fácil - fácil
      default: return 0.5; // Valor padrão
    }
  }
  
  // Calcula a próxima data de revisão com base no estado atual
  calculateNextDueDate(state: FlashcardState): Date {
    return state.due;
  }
  
  // Verifica se um flashcard está vencido (precisa ser revisado)
  isDue(state: FlashcardState, referenceDate: Date = new Date()): boolean {
    return state.due <= referenceDate;
  }
  
  // Método para compatibilidade com o código existente
  repeat(state: FlashcardState, now: Date, rating: Rating) {
    return this.review(state, rating);
  }
}
