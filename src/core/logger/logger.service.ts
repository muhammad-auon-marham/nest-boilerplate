import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private winstonLogger: winston.Logger;

  constructor() {
    super();
    const logDir = path.join(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create logs directory:', err);
      }
    }

    const transports: any[] = [];

    try {
      console.log(`[LoggerService] Log directory path: ${logDir}`);

      // Check if directory exists
      if (fs.existsSync(logDir)) {
        console.log(`[LoggerService] Directory exists.`);
        try {
          fs.accessSync(logDir, fs.constants.W_OK);
          console.log(`[LoggerService] Directory is writable.`);
        } catch (e) {
          console.error(
            `[LoggerService] Directory is NOT writable: ${e.message}`,
          );
          throw e;
        }
      } else {
        console.log(
          `[LoggerService] Directory does NOT exist. Attempting to create...`,
        );
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`[LoggerService] Directory created.`);
      }

      transports.push(
        new winston.transports.DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
        }),
      );

      transports.push(
        new winston.transports.DailyRotateFile({
          filename: path.join(logDir, '%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      );

      console.log(`[LoggerService] File transports configured successfully.`);
    } catch (err) {
      console.error(
        `UNKNOWN ERROR: Unable to configure file logging. Path: ${logDir}. Error: ${err.message}`,
      );
    }

    // Always add console transport for visibility in Docker logs
    transports.push(new winston.transports.Console());

    this.winstonLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        // winston.format.timestamp(),
        winston.format.timestamp({
          format: () =>
            new Date()
              .toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: process.env.TZ,
              })
              .replace(/(\d+)\/(\d+)\/(\d+),?/, '$3-$2-$1')
              .toUpperCase(),
        }),
        winston.format.json(),
      ),
      transports: transports,
    });

    // Handle transport errors (e.g., permissions)
    this.winstonLogger.on('error', (err) => {
      console.error('Winston Logger Error:', err);
    });
  }

  log(message: any, context?: string, jwtUserId?: number | null) {
    // super.log(message, context);
    this.winstonLogger.info(message, {
      context,
      jwtUserId: jwtUserId ?? undefined,
    });
  }

  error(
    message: any,
    trace?: string,
    context?: string,
    jwtUserId?: number | null,
  ) {
    // super.error(message, trace, context);
    this.winstonLogger.error(message, {
      trace,
      context,
      jwtUserId: jwtUserId ?? undefined,
    });
  }

  warn(message: any, context?: string, jwtUserId?: number | null) {
    // super.warn(message, context);
    this.winstonLogger.warn(message, {
      context,
      jwtUserId: jwtUserId ?? undefined,
    });
  }

  debug(message: any, context?: string, jwtUserId?: number | null) {
    // super.debug(message, context);
    this.winstonLogger.debug(message, {
      context,
      jwtUserId: jwtUserId ?? undefined,
    });
  }

  verbose(message: any, context?: string, jwtUserId?: number | null) {
    // super.verbose(message, context);
    this.winstonLogger.verbose(message, {
      context,
      jwtUserId: jwtUserId ?? undefined,
    });
  }
}
