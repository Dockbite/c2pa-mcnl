type Color =
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'bright';

const colors: Record<Color, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m',
};

const reset = '\x1b[0m';

export function log(message: string, color: Color = 'white') {
  console.log(colors[color] + message + reset);
}

export function header(text: string) {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'bright');
  log(text, 'cyan');
  log('═══════════════════════════════════════════════════════════', 'bright');
  console.log('\n');
}
