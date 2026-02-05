import { createInterface, Interface } from 'node:readline';
import { colors } from './colors';

/**
 * Create a readline interface for interactive CLI input
 * @returns A readline Interface instance
 */
export function createReadlineInterface(): Interface {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt the user with a question and wait for input
 * @param rl The readline interface
 * @param prompt The question/prompt to display
 * @param defaultValue Optional default value if user provides no input
 * @returns Promise that resolves to the user's answer
 */
export function question(
  rl: Interface,
  prompt: string,
  defaultValue?: string,
): Promise<string> {
  return new Promise((resolve) => {
    const coloredPrompt = `${colors.blue}${prompt}${colors.reset}`;
    const fullPrompt = defaultValue
      ? `${coloredPrompt}[${defaultValue}]: `
      : coloredPrompt;

    rl.question(fullPrompt, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}
