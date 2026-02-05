import { log } from '@c2pa-mcnl/shared/node/utils';

export function displayFinalSummary(domain: string, outputDir: string) {
  const actualDomain = domain.replace(/%3A/g, ':');
  const protocol = actualDomain.includes('localhost') ? 'http' : 'https';

  log('All files have been generated in:', 'green');
  log(`   ${outputDir}\n`, 'bright');

  log('Generated files:', 'cyan');
  log('   📄 private-key.pem       - Private key (keep secure!)', 'yellow');
  log(
    '   📄 private-key.hex       - Private key hex format (for signing)',
    'yellow',
  );
  log('   📄 public-key.pem        - Public key', 'yellow');
  log('   📄 public-key.jwk        - Public key in JWK format', 'yellow');
  log(
    '   📄 did.json              - DID document (upload to server)',
    'yellow',
  );
  log(
    '   📄 credential-*.jwt      - Verifiable Credential (JWT format)',
    'yellow',
  );
  log(
    '   📄 credential-*.json     - Verifiable Credential (JSON format)',
    'yellow',
  );
  log('   📄 credential-summary.json - Credential overview', 'yellow');

  log('\n📋 Next steps:', 'cyan');
  log(
    `   1. Upload did.json to: ${protocol}://${actualDomain}/.well-known/did.json`,
    'blue',
  );
  log('   2. Ensure CORS headers are set on your server:', 'blue');
  log('      Access-Control-Allow-Origin: *', 'yellow');
  log('      Content-Type: application/json', 'yellow');
  log('   3. Test DID resolution:', 'blue');
  log(
    `      curl ${protocol}://${actualDomain}/.well-known/did.json`,
    'yellow',
  );

  log('   5. Import credential to a wallet:', 'blue');
  log('      - Scan the QR code with a wallet app', 'yellow');
  log('      - Upload the .jwt or .json file', 'yellow');
  log('      - Copy/paste the JWT string', 'yellow');

  log('\n🔍 Verification:', 'cyan');
  log('   Wallets will:', 'blue');
  log(`   1. Resolve your DID`, 'yellow');
  log(
    `   2. Fetch: ${protocol}://${actualDomain}/.well-known/did.json`,
    'yellow',
  );
  log('   3. Extract the public key', 'yellow');
  log('   4. Verify the JWT signature', 'yellow');
  log('   5. Display the credential if valid ✓', 'yellow');

  log('\n⚠️  Security reminders:', 'red');
  log('   - Never commit private keys to version control', 'yellow');
  log('   - Store private keys in a secure secrets manager', 'yellow');
  log('   - Use HTTPS for production DID hosting', 'yellow');
  log('   - Only share credentials with intended recipients', 'yellow');

  log('\n💡 Compatible Wallets:', 'cyan');
  log('   - Lissi Wallet (iOS/Android)', 'blue');
  log('   - Esatus Wallet (iOS/Android)', 'blue');
  log('   - Walt.id Web Wallet', 'blue');
  log('   - Veramo Agent', 'blue');
  log('   - Any W3C VC wallet supporting did:web + JWT format', 'blue');
}
