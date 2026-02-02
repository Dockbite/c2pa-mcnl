import { createInterface, Interface } from 'node:readline';
import { colors } from './colors';

// Create readline interface for user input (for interactive mode)
export function createReadlineInterface() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function question(rl: Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors['blue']}${prompt}${colors['reset']}`, (answer) => {
      resolve(answer);
    });
  });
}
