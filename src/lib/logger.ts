/**
 * Sistema de logs para a aplicação
 * Fornece funções para registrar eventos com diferentes níveis de severidade
 * e contexto estruturado para facilitar a depuração.
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  source: string;
}

/**
 * Determina se um determinado nível de log deve ser exibido
 * com base na configuração da aplicação
 */
const shouldLog = (level: LogLevel): boolean => {
  // Configuração baseada em ambiente
  const minLevel = process.env.NODE_ENV === 'production' 
    ? LogLevel.INFO  // Em produção, mostrar INFO e acima
    : LogLevel.DEBUG; // Em desenvolvimento, mostrar todos
    
  const levelOrder = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3,
  };
  
  return levelOrder[level] <= levelOrder[minLevel];
};

/**
 * Escreve uma entrada de log no destino apropriado
 */
const writeLog = (entry: LogEntry) => {
  // Serializar a entrada de log
  const serialized = JSON.stringify(entry, null, process.env.NODE_ENV === 'development' ? 2 : 0);
  
  switch (entry.level) {
    case LogLevel.ERROR:
      console.error(serialized);
      break;
    case LogLevel.WARN:
      console.warn(serialized);
      break;
    case LogLevel.INFO:
    case LogLevel.DEBUG:
    default:
      console.log(serialized);
      break;
  }
  
  // Aqui poderia ser implementada a persistência em um sistema de logs externo
  // como Datadog, LogDNA, etc, ou em um banco de dados específico para logs
  
  // Exemplo: se quiser adicionar logs em arquivo no futuro
  // if (process.env.NODE_ENV === 'production') {
  //   logToFile(entry);
  // }
};

/**
 * Cria uma entrada de log com o contexto fornecido
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  source: string,
  context?: Record<string, any>,
  userId?: string
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  source,
  context,
  userId,
});

/**
 * Registra um erro
 */
export const logError = (
  message: string,
  source: string,
  context?: Record<string, any>,
  userId?: string
) => {
  const entry = createLogEntry(LogLevel.ERROR, message, source, context, userId);
  if (shouldLog(LogLevel.ERROR)) {
    writeLog(entry);
  }
  return entry;
};

/**
 * Registra um aviso
 */
export const logWarn = (
  message: string,
  source: string,
  context?: Record<string, any>,
  userId?: string
) => {
  const entry = createLogEntry(LogLevel.WARN, message, source, context, userId);
  if (shouldLog(LogLevel.WARN)) {
    writeLog(entry);
  }
  return entry;
};

/**
 * Registra uma informação
 */
export const logInfo = (
  message: string,
  source: string,
  context?: Record<string, any>,
  userId?: string
) => {
  const entry = createLogEntry(LogLevel.INFO, message, source, context, userId);
  if (shouldLog(LogLevel.INFO)) {
    writeLog(entry);
  }
  return entry;
};

/**
 * Registra uma informação de depuração
 */
export const logDebug = (
  message: string,
  source: string,
  context?: Record<string, any>,
  userId?: string
) => {
  const entry = createLogEntry(LogLevel.DEBUG, message, source, context, userId);
  if (shouldLog(LogLevel.DEBUG)) {
    writeLog(entry);
  }
  return entry;
};

/**
 * Logger principal da aplicação
 */
export const logger = {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
};

/**
 * Registra logs de eventos de pagamento
 */
export const paymentLogger = {
  error: (message: string, context?: Record<string, any>, userId?: string) => 
    logError(message, 'payment', context, userId),
  warn: (message: string, context?: Record<string, any>, userId?: string) => 
    logWarn(message, 'payment', context, userId),
  info: (message: string, context?: Record<string, any>, userId?: string) => 
    logInfo(message, 'payment', context, userId),
  debug: (message: string, context?: Record<string, any>, userId?: string) => 
    logDebug(message, 'payment', context, userId),
};

/**
 * Registra logs específicos do webhook do Stripe
 */
export const stripeWebhookLogger = {
  error: (message: string, context?: Record<string, any>, userId?: string) => 
    logError(message, 'stripe:webhook', context, userId),
  warn: (message: string, context?: Record<string, any>, userId?: string) => 
    logWarn(message, 'stripe:webhook', context, userId),
  info: (message: string, context?: Record<string, any>, userId?: string) => 
    logInfo(message, 'stripe:webhook', context, userId),
  debug: (message: string, context?: Record<string, any>, userId?: string) => 
    logDebug(message, 'stripe:webhook', context, userId),
};

export default logger;
