/**
 * src/lib/logger.ts
 * 
 * Structured logging system with different log levels and contexts.
 */

import { config } from "./config";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "\x1b[36m", // Cyan
  [LogLevel.INFO]: "\x1b[32m",  // Green
  [LogLevel.WARN]: "\x1b[33m",  // Yellow
  [LogLevel.ERROR]: "\x1b[31m", // Red
};

const RESET_COLOR = "\x1b[0m";

export interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string) {
    this.context = context;
    this.minLevel = LOG_LEVEL_MAP[config.logLevel] || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const color = LOG_LEVEL_COLORS[level];
    
    let formatted = `${color}[${timestamp}] [${levelName}] [${this.context}]${RESET_COLOR} ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    return formatted;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        ...(error instanceof Error
          ? {
              error: error.message,
              stack: error.stack,
            }
          : { error: String(error) }),
      };
      console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    }
  }

  // Create a child logger with additional context
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }
}

// Create logger instances for different modules
export const createLogger = (context: string): Logger => new Logger(context);

// Default logger
export const logger = createLogger("App");

// Made with Bob
