// ANSI color codes for pretty output
export const colors: Record<string, string> = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

export function log(message: string, color = 'reset') {
  console.log(`${colors[color]}${message}${colors['reset']}`);
}

export function header(message: string) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60) + '\n');
}
