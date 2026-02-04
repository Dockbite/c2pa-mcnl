import { log } from '@c2pa-mcnl/shared/utils';

export function displayCertificateInfo(
  certType: 'root' | 'intermediate' | 'leaf',
  subject: string,
  issuer?: string,
) {
  log(
    `\n✅ ${certType.charAt(0).toUpperCase() + certType.slice(1)} Certificate Generated`,
    'green',
  );
  log(`   Subject: ${subject}`, 'cyan');
  if (issuer) {
    log(`   Issuer: ${issuer}`, 'cyan');
  }
}

export function displayFinalSummary(outputDir: string, certTypes: string[]) {
  log('\n📁 Output directory:', 'bright');
  log(`   ${outputDir}`, 'cyan');

  log('\n📄 Generated files:', 'bright');
  certTypes.forEach((type) => {
    log(`   - ${type}-cert.pem`, 'cyan');
    log(`   - ${type}-private-key.pem`, 'cyan');
  });

  // If it's a chain, also mention the chain.pem file
  if (certTypes.length > 1) {
    log(`   - chain.pem (complete certificate chain)`, 'cyan');
  }

  log('\n💡 Next steps:', 'bright');
  log('   1. Store certificates securely', 'yellow');
  log(
    '   2. Configure your application to use the certificate chain',
    'yellow',
  );
  log(
    '   3. Keep private keys secure and never commit them to version control',
    'yellow',
  );
}
