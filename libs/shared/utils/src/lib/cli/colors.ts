// ANSI color codes for CLI output
type Color =
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'bright'
  | 'reset';

const colors: Record<Color, string> = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m',
  reset: '\x1b[0m',
};

/**
 * Log a message with optional color
 * @param message The message to log
 * @param color The color to use (defaults to 'white')
 */
export function log(message: string, color: Color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Display a header with decorative borders
 * @param text The header text to display
 */
export function header(text: string) {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'bright');
  log(text, 'cyan');
  log('═══════════════════════════════════════════════════════════', 'bright');
  console.log('\n');
}

/**
 * Get the ANSI color code for a specific color
 * @param color The color name
 * @returns The ANSI color code
 */
export function getColor(color: Color): string {
  return colors[color];
}

/**
 * Export colors object for direct access if needed
 */
export { colors };
export type { Color };
