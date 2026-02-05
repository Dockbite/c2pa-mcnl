import fs from 'node:fs';
import path from 'node:path';
import * as readline from 'node:readline';
import { Command } from 'commander';
import { displayCertificateInfo, displayFinalSummary } from './display';
import {
  createOutputDirectory as createOutputDir,
  createReadlineInterface,
  header,
  log,
  question,
} from '@c2pa-mcnl/shared/node/utils';
import {
  type CertificateSubject,
  generateCertificateChain,
  generateIntermediateCertificate,
  generateLeafCertificate,
  generateRootCertificate,
  importCertificateFromPem,
  importPrivateKeyFromPem,
} from './cert-generator';

interface CommandOptions {
  output?: string;
  interactive?: boolean;
  country?: string;
  state?: string;
  organization?: string;
  organizationalUnit?: string;
  commonName?: string;
  serialNumber?: string;
  includeLeaf?: boolean;
  rootCert?: string;
  rootKey?: string;
  intermediateCert?: string;
  intermediateKey?: string;
  root?: Record<string, string>;
  intermediate?: Record<string, string>;
  leaf?: Record<string, string>;
}

function createOutputDirectory(customPath?: string): string {
  return createOutputDir('cert-generator', customPath);
}

async function collectSubjectData(
  rl: readline.Interface | null,
  options: CommandOptions,
  certType: 'root' | 'intermediate' | 'leaf',
): Promise<CertificateSubject> {
  log(
    `\n📝 ${certType.charAt(0).toUpperCase() + certType.slice(1)} Certificate Details`,
    'cyan',
  );

  const subject: CertificateSubject = {
    commonName: '',
  };

  if (rl) {
    subject.country =
      options.country || (await question(rl, 'Country (C): ', 'NL'));
    subject.state =
      options.state ||
      (await question(rl, 'State/Province (ST): ', 'Zuid-Holland'));
    subject.organization =
      options.organization ||
      (await question(rl, 'Organization (O): ', 'My Company'));
    subject.organizationalUnit =
      options.organizationalUnit ||
      (await question(rl, 'Organizational Unit (OU): ', 'IT Department'));
    subject.commonName =
      options.commonName ||
      (await question(
        rl,
        'Common Name (CN): ',
        `${certType.charAt(0).toUpperCase() + certType.slice(1)} CA`,
      ));
  } else {
    subject.country = options.country;
    subject.state = options.state;
    subject.organization = options.organization;
    subject.organizationalUnit = options.organizationalUnit;
    subject.commonName = options.commonName || '';
  }

  if (!subject.commonName) {
    throw new Error('Common Name (CN) is required');
  }

  return subject;
}

/**
 * Generate complete certificate chain (root + intermediate + optional leaf)
 */
export async function chainCommand(options: CommandOptions) {
  const rl = options.interactive !== false ? createReadlineInterface() : null;

  try {
    console.clear();
    log(
      '╔════════════════════════════════════════════════════════════╗',
      'bright',
    );
    log(
      '║          Certificate Chain Generator CLI Tool             ║',
      'bright',
    );
    log(
      '║      Generate Root + Intermediate + Optional Leaf         ║',
      'bright',
    );
    log(
      '╚════════════════════════════════════════════════════════════╝',
      'bright',
    );

    const outputDir = createOutputDirectory(options.output);
    log(`\n📁 Output directory: ${outputDir}\n`, 'cyan');

    const includeLeaf = options.includeLeaf !== false;

    // Use top-level options as defaults for all certificates if specific options aren't provided
    const rootOptions = options.root || {
      country: options.country,
      state: options.state,
      organization: options.organization,
      organizationalUnit: options.organizationalUnit,
      commonName: options.commonName,
    };

    const intermediateOptions = options.intermediate || {
      country: options.country,
      state: options.state,
      organization: options.organization,
      organizationalUnit: options.organizationalUnit,
      commonName: options.commonName
        ? `${options.commonName} - Intermediate`
        : undefined,
    };

    const leafOptions = options.leaf || {
      country: options.country,
      state: options.state,
      organization: options.organization,
      organizationalUnit: options.organizationalUnit,
      commonName: options.commonName
        ? `${options.commonName} - Leaf`
        : undefined,
    };

    // Collect root certificate data
    header('Root Certificate');
    const rootSubject = await collectSubjectData(rl, rootOptions, 'root');

    // Collect intermediate certificate data
    header('Intermediate Certificate');
    const intermediateSubject = await collectSubjectData(
      rl,
      intermediateOptions,
      'intermediate',
    );

    // Collect leaf certificate data if needed
    let leafSubject: CertificateSubject | undefined;
    if (includeLeaf) {
      header('Leaf Certificate');
      leafSubject = await collectSubjectData(rl, leafOptions, 'leaf');
    }

    // Generate the chain
    log('\n⏳ Generating certificate chain...', 'yellow');
    const chain = await generateCertificateChain(
      rootSubject,
      intermediateSubject,
      leafSubject,
    );

    // Save root certificate
    fs.writeFileSync(
      path.join(outputDir, 'root-cert.pem'),
      chain.root.certificatePem,
    );
    fs.writeFileSync(
      path.join(outputDir, 'root-private-key.pem'),
      chain.root.privateKeyPem,
    );
    displayCertificateInfo('root', rootSubject.commonName);

    // Save intermediate certificate
    fs.writeFileSync(
      path.join(outputDir, 'intermediate-cert.pem'),
      chain.intermediate.certificatePem,
    );
    fs.writeFileSync(
      path.join(outputDir, 'intermediate-private-key.pem'),
      chain.intermediate.privateKeyPem,
    );
    displayCertificateInfo(
      'intermediate',
      intermediateSubject.commonName,
      rootSubject.commonName,
    );

    // Save leaf certificate if generated
    const certTypes = ['root', 'intermediate'];
    if (chain.leaf && leafSubject) {
      fs.writeFileSync(
        path.join(outputDir, 'leaf-cert.pem'),
        chain.leaf.certificatePem,
      );
      fs.writeFileSync(
        path.join(outputDir, 'leaf-private-key.pem'),
        chain.leaf.privateKeyPem,
      );
      displayCertificateInfo(
        'leaf',
        leafSubject.commonName,
        intermediateSubject.commonName,
      );
      certTypes.push('leaf');
    }

    // Save chain file
    const chainPem = [
      chain.root.certificatePem,
      chain.intermediate.certificatePem,
      chain.leaf?.certificatePem,
    ]
      .filter(Boolean)
      .join('\n');
    fs.writeFileSync(path.join(outputDir, 'chain.pem'), chainPem);

    header('✅ Complete!');
    displayFinalSummary(outputDir, certTypes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('\n❌ Error: ' + errorMessage, 'red');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (rl) rl.close();
  }
}

/**
 * Generate only root certificate
 */
export async function rootCommand(options: CommandOptions) {
  const rl = options.interactive !== false ? createReadlineInterface() : null;

  try {
    console.clear();
    header('Generate Root Certificate');

    const outputDir = createOutputDirectory(options.output);
    log(`📁 Output directory: ${outputDir}\n`, 'cyan');

    const subject = await collectSubjectData(rl, options, 'root');

    log('\n⏳ Generating root certificate...', 'yellow');
    const root = await generateRootCertificate(
      subject,
      options.serialNumber || '01',
    );

    fs.writeFileSync(
      path.join(outputDir, 'root-cert.pem'),
      root.certificatePem,
    );
    fs.writeFileSync(
      path.join(outputDir, 'root-private-key.pem'),
      root.privateKeyPem,
    );

    displayCertificateInfo('root', subject.commonName);
    displayFinalSummary(outputDir, ['root']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('\n❌ Error: ' + errorMessage, 'red');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (rl) rl.close();
  }
}

/**
 * Generate intermediate certificate from existing root
 */
export async function intermediateCommand(options: CommandOptions) {
  const rl = options.interactive !== false ? createReadlineInterface() : null;

  try {
    console.clear();
    header('Generate Intermediate Certificate');

    let rootCertFile = options.rootCert;
    let rootKeyFile = options.rootKey;

    // Interactive prompts for missing values
    if (rl) {
      if (!rootCertFile) {
        rootCertFile = await question(
          rl,
          'Enter path to root certificate PEM file: ',
        );
      }
      if (!rootKeyFile) {
        rootKeyFile = await question(
          rl,
          'Enter path to root private key PEM file: ',
        );
      }
    }

    if (!rootCertFile || !rootKeyFile) {
      log('❌ Root certificate and private key are required!', 'red');
      log(
        '   Use --root-cert and --root-key flags or run in interactive mode.',
        'yellow',
      );
      if (rl) rl.close();
      return;
    }

    const outputDir = createOutputDirectory(options.output);
    log(`\n📁 Output directory: ${outputDir}\n`, 'cyan');

    const subject = await collectSubjectData(rl, options, 'intermediate');

    log('\n⏳ Loading root certificate...', 'yellow');
    const rootCertPem = fs.readFileSync(rootCertFile, 'utf8');
    const rootKeyPem = fs.readFileSync(rootKeyFile, 'utf8');

    const rootCert = await importCertificateFromPem(rootCertPem);
    const rootKey = await importPrivateKeyFromPem(rootKeyPem);

    log('⏳ Generating intermediate certificate...', 'yellow');
    const intermediate = await generateIntermediateCertificate(
      subject,
      rootCert,
      rootKey,
      options.serialNumber || '02',
    );

    fs.writeFileSync(
      path.join(outputDir, 'intermediate-cert.pem'),
      intermediate.certificatePem,
    );
    fs.writeFileSync(
      path.join(outputDir, 'intermediate-private-key.pem'),
      intermediate.privateKeyPem,
    );

    displayCertificateInfo(
      'intermediate',
      subject.commonName,
      rootCert.subject,
    );
    displayFinalSummary(outputDir, ['intermediate']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('\n❌ Error: ' + errorMessage, 'red');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (rl) rl.close();
  }
}

/**
 * Generate leaf certificate from existing intermediate
 */
export async function leafCommand(options: CommandOptions) {
  const rl = options.interactive !== false ? createReadlineInterface() : null;

  try {
    console.clear();
    header('Generate Leaf Certificate');

    let intermediateCertFile = options.intermediateCert;
    let intermediateKeyFile = options.intermediateKey;

    // Interactive prompts for missing values
    if (rl) {
      if (!intermediateCertFile) {
        intermediateCertFile = await question(
          rl,
          'Enter path to intermediate certificate PEM file: ',
        );
      }
      if (!intermediateKeyFile) {
        intermediateKeyFile = await question(
          rl,
          'Enter path to intermediate private key PEM file: ',
        );
      }
    }

    if (!intermediateCertFile || !intermediateKeyFile) {
      log('❌ Intermediate certificate and private key are required!', 'red');
      log(
        '   Use --intermediate-cert and --intermediate-key flags or run in interactive mode.',
        'yellow',
      );
      if (rl) rl.close();
      return;
    }

    const outputDir = createOutputDirectory(options.output);
    log(`\n📁 Output directory: ${outputDir}\n`, 'cyan');

    const subject = await collectSubjectData(rl, options, 'leaf');

    log('\n⏳ Loading intermediate certificate...', 'yellow');
    const intermediateCertPem = fs.readFileSync(intermediateCertFile, 'utf8');
    const intermediateKeyPem = fs.readFileSync(intermediateKeyFile, 'utf8');

    const intermediateCert =
      await importCertificateFromPem(intermediateCertPem);
    const intermediateKey = await importPrivateKeyFromPem(intermediateKeyPem);

    log('⏳ Generating leaf certificate...', 'yellow');
    const leaf = await generateLeafCertificate(
      subject,
      intermediateCert,
      intermediateKey,
      options.serialNumber || '03',
    );

    fs.writeFileSync(
      path.join(outputDir, 'leaf-cert.pem'),
      leaf.certificatePem,
    );
    fs.writeFileSync(
      path.join(outputDir, 'leaf-private-key.pem'),
      leaf.privateKeyPem,
    );

    displayCertificateInfo(
      'leaf',
      subject.commonName,
      intermediateCert.subject,
    );
    displayFinalSummary(outputDir, ['leaf']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('\n❌ Error: ' + errorMessage, 'red');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (rl) rl.close();
  }
}

/**
 * Setup Commander CLI
 */
export function setupCLI() {
  const program = new Command();

  program
    .name('cert-generator')
    .description(
      'X.509 Certificate Chain Generator - Create root, intermediate, and leaf certificates',
    )
    .version('1.0.0');

  // Main command - generate complete chain
  program
    .command('chain')
    .description(
      'Generate complete certificate chain (root + intermediate + optional leaf)',
    )
    .option('-o, --output <directory>', 'Output directory for generated files')
    .option('--no-include-leaf', 'Do not generate leaf certificate')
    .option('--country <country>', 'Country code (e.g., NL)')
    .option('--state <state>', 'State or province')
    .option('--organization <org>', 'Organization name')
    .option('--organizational-unit <unit>', 'Organizational unit')
    .option('--common-name <name>', 'Common name')
    .option('--no-interactive', 'Run in non-interactive mode')
    .action(chainCommand);

  // Root certificate command
  program
    .command('root')
    .description('Generate only a root certificate')
    .option('-o, --output <directory>', 'Output directory for generated files')
    .option('--country <country>', 'Country code (e.g., NL)')
    .option('--state <state>', 'State or province')
    .option('--organization <org>', 'Organization name')
    .option('--organizational-unit <unit>', 'Organizational unit')
    .option('--common-name <name>', 'Common name')
    .option('--serial-number <number>', 'Certificate serial number', '01')
    .option('--no-interactive', 'Run in non-interactive mode')
    .action(rootCommand);

  // Intermediate certificate command
  program
    .command('intermediate')
    .description('Generate intermediate certificate from existing root')
    .option('--root-cert <file>', 'Path to root certificate PEM file')
    .option('--root-key <file>', 'Path to root private key PEM file')
    .option('-o, --output <directory>', 'Output directory for generated files')
    .option('--country <country>', 'Country code (e.g., NL)')
    .option('--state <state>', 'State or province')
    .option('--organization <org>', 'Organization name')
    .option('--organizational-unit <unit>', 'Organizational unit')
    .option('--common-name <name>', 'Common name')
    .option('--serial-number <number>', 'Certificate serial number', '02')
    .option('--no-interactive', 'Run in non-interactive mode')
    .action(intermediateCommand);

  // Leaf certificate command
  program
    .command('leaf')
    .description('Generate leaf certificate from existing intermediate')
    .option(
      '--intermediate-cert <file>',
      'Path to intermediate certificate PEM file',
    )
    .option(
      '--intermediate-key <file>',
      'Path to intermediate private key PEM file',
    )
    .option('-o, --output <directory>', 'Output directory for generated files')
    .option('--country <country>', 'Country code (e.g., NL)')
    .option('--state <state>', 'State or province')
    .option('--organization <org>', 'Organization name')
    .option('--organizational-unit <unit>', 'Organizational unit')
    .option('--common-name <name>', 'Common name')
    .option('--serial-number <number>', 'Certificate serial number', '03')
    .option('--no-interactive', 'Run in non-interactive mode')
    .action(leafCommand);

  return program;
}
