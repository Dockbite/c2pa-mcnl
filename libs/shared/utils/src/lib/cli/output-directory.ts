import fs from 'node:fs';
import path from 'node:path';

/**
 * Create an output directory with optional timestamp
 * @param baseName The base name for the output directory (e.g., 'cert-generator', 'did-generator')
 * @param customPath Optional custom path. If provided, uses this path directly
 * @returns The absolute path to the created output directory
 */
export function createOutputDirectory(
  baseName: string,
  customPath?: string,
): string {
  if (customPath) {
    const resolvedPath = path.resolve(customPath);
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }
    return resolvedPath;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputDir = path.join(process.cwd(), 'output', baseName, timestamp);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return outputDir;
}
