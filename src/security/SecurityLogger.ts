// Placeholder for SecurityLogger module
export class SecurityLogger {
  private static logEntries: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: any;
  }> = [];
  
  private static maxEntries = 1000;
  
  static info(message: string, data?: any): void {
    this.addLogEntry('info', message, data);
    console.info(`[SECURITY] ${message}`, data);
  }
  
  static warn(message: string, data?: any): void {
    this.addLogEntry('warn', message, data);
    console.warn(`[SECURITY] ${message}`, data);
  }
  
  static error(message: string, data?: any): void {
    this.addLogEntry('error', message, data);
    console.error(`[SECURITY] ${message}`, data);
  }
  
  private static addLogEntry(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    this.logEntries.push({
      timestamp: new Date(),
      level,
      message,
      data
    });
    
    // Limit the number of entries
    if (this.logEntries.length > this.maxEntries) {
      this.logEntries.shift();
    }
  }
  
  static getLogEntries(): Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: any;
  }> {
    return [...this.logEntries];
  }
  
  static clearLogs(): void {
    this.logEntries = [];
  }
}