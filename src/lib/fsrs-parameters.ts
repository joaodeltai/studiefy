// Parâmetros otimizados para o algoritmo FSRS (Free Spaced Repetition Scheduler)
// Baseado na implementação de referência: https://github.com/open-spaced-repetition/fsrs.js

// Parâmetros padrão do FSRS
export const defaultParameters = {
  // Retenção alvo (probabilidade desejada de lembrar um item na próxima revisão)
  request_retention: 0.9,
  
  // Intervalo máximo em dias
  maximum_interval: 36500,
  
  // Pesos do modelo de regressão logística
  // Estes valores foram otimizados com base em milhões de revisões
  w: [
    0.4, // w[0] - Intercepto para estado de aprendizado
    0.6, // w[1] - Estabilidade para estado de aprendizado
    2.4, // w[2] - Dificuldade para estado de aprendizado
    5.8, // w[3] - Intercepto para estado de revisão
    4.93, // w[4] - Estabilidade para estado de revisão
    0.94, // w[5] - Dificuldade para estado de revisão
    0.86, // w[6] - Intercepto para estado de reaprendizado
    0.01, // w[7] - Estabilidade para estado de reaprendizado
    1.49, // w[8] - Dificuldade para estado de reaprendizado
    0.14, // w[9] - Fator de esquecimento para rating "Esqueci"
    0.94, // w[10] - Fator de esquecimento para rating "Difícil"
    2.18, // w[11] - Fator de esquecimento para rating "Bom"
    0.05, // w[12] - Fator de esquecimento para rating "Fácil"
    0.34, // w[13] - Fator de dificuldade para rating "Esqueci"
    1.26, // w[14] - Fator de dificuldade para rating "Difícil"
    0.29, // w[15] - Fator de dificuldade para rating "Bom"
    2.61  // w[16] - Fator de dificuldade para rating "Fácil"
  ],
};

// Mapeamento de ratings para descrições
export const ratingDescriptions = {
  1: "Esqueci", // Não conseguiu lembrar
  2: "Difícil",  // Lembrou com dificuldade
  3: "Bom",     // Lembrou adequadamente
  4: "Fácil"    // Lembrou facilmente
};

// Mapeamento de estados para descrições
export const stateDescriptions = {
  0: "Novo",         // Nunca revisado
  1: "Aprendendo",    // Em processo de aprendizado inicial
  2: "Revisão",       // Em revisão espaçada
  3: "Reaprendendo"   // Falhou em uma revisão e está sendo reaprendido
};

// Intervalos iniciais para cada rating (em dias)
export const initialIntervals = {
  1: 0,    // Esqueci: repetir no mesmo dia
  2: 1,    // Difícil: repetir no dia seguinte
  3: 3,    // Bom: repetir em 3 dias
  4: 6     // Fácil: repetir em 6 dias
};
