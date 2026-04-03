import fs from 'fs';
import path from 'path';
import { ROOT_FOLDER } from "../utils/fs-helpers.util";

type LevelType = "error" | "info";

export class BaseLogger {
  private filename: string;
  private level: LevelType;
  private logPath: string;
  
  constructor(filename: string, level: LevelType = "error") {
    this.filename = filename;
    this.level = level;
    this.logPath = path.join(ROOT_FOLDER, 'logs', filename);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  get logger() {
    return {
      error: (message: string) => {
        if (this.level === 'error') {
          fs.appendFileSync(this.logPath, message + '\n');
        }
      },
      info: (message: string) => {
        if (this.level === 'info') {
          fs.appendFileSync(this.logPath, message + '\n');
        }
      }
    };
  }
}
