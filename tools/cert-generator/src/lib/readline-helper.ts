import * as readline from 'node:readline';

export function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function question(
  rl: readline.Interface,
  query: string,
  defaultValue?: string,
): Promise<string> {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${query}[${defaultValue}]: ` : query;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}
