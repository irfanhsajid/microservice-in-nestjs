import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {
  private logDir = 'logs';

  constructor(context?: string) {
    super(context || 'Application');

    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.writeToFile('info', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.writeToFile('error', message, context, stack);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.writeToFile('warn', message, context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.writeToFile('debug', message, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.writeToFile('verbose', message, context);
  }

  private writeToFile(
    level: string,
    message: any,
    context?: string,
    stack?: string,
  ) {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(this.logDir, `${formattedDate}.log`);
    const errorFile = path.join(this.logDir, `${formattedDate}-error.log`);

    const timestamp = date.toISOString();
    const logContext = context || this.context || 'Application';
    let logMessage = `${timestamp} [${level.toUpperCase()}] [${logContext}] ${message}`;

    if (stack) {
      logMessage += `\n${stack}`;
    }

    fs.appendFileSync(logFile, logMessage + '\n');

    // Write errors to a separate file
    if (level === 'error') {
      fs.appendFileSync(errorFile, logMessage + '\n');
    }
  }
}
